import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import type { Cache } from 'cache-manager';

const LOGIN_FAIL_TTL_MS = 10 * 60 * 1000;
const CAPTCHA_TTL_MS = 30 * 60 * 1000;
const LOCK_TTL_MS = 15 * 60 * 1000;

const CAPTCHA_THRESHOLD = 5;
const LOCK_THRESHOLD = 10;

const ACTION_LIMITS: Record<string, { limit: number; ttlMs: number }> = {
  register: { limit: 3, ttlMs: 15 * 60 * 1000 },
  requestPasswordReset: { limit: 5, ttlMs: 15 * 60 * 1000 },
  requestVerificationCode: { limit: 5, ttlMs: 15 * 60 * 1000 },
};

@Injectable()
export class AuthAttemptsService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getLoginState(email: string): Promise<{ failCount: number; captchaRequired: boolean; locked: boolean }> {
    const normalized = this.normalizeEmail(email);
    const [failCountValue, captchaFlag, lockFlag] = await Promise.all([
      this.cacheManager.get<string>(this.failKey(normalized)),
      this.cacheManager.get<string>(this.captchaKey(normalized)),
      this.cacheManager.get<string>(this.lockKey(normalized)),
    ]);

    return {
      failCount: Number(failCountValue || 0),
      captchaRequired: Boolean(captchaFlag),
      locked: Boolean(lockFlag),
    };
  }

  async recordFailure(email: string): Promise<number> {
    const normalized = this.normalizeEmail(email);
    const key = this.failKey(normalized);
    const current = Number((await this.cacheManager.get<string>(key)) || 0);
    const next = current + 1;

    await this.cacheManager.set(key, next.toString(), LOGIN_FAIL_TTL_MS);

    if (next >= CAPTCHA_THRESHOLD) {
      await this.cacheManager.set(this.captchaKey(normalized), '1', CAPTCHA_TTL_MS);
    }

    if (next >= LOCK_THRESHOLD) {
      await this.cacheManager.set(this.lockKey(normalized), '1', LOCK_TTL_MS);
    }

    await this.applyBackoff(next);
    return next;
  }

  async recordSuccess(email: string): Promise<void> {
    const normalized = this.normalizeEmail(email);
    await Promise.all([
      this.cacheManager.del(this.failKey(normalized)),
      this.cacheManager.del(this.captchaKey(normalized)),
      this.cacheManager.del(this.lockKey(normalized)),
    ]);
  }

  async checkEmailActionAllowed(email: string, action: keyof typeof ACTION_LIMITS): Promise<void> {
    const limitConfig = ACTION_LIMITS[action];
    const normalized = this.normalizeEmail(email);
    const key = this.actionKey(action, normalized);
    const current = Number((await this.cacheManager.get<string>(key)) || 0);

    if (current >= limitConfig.limit) {
      throw new HttpException('Too many requests. Try again later.', HttpStatus.TOO_MANY_REQUESTS);
    }

    await this.cacheManager.set(key, (current + 1).toString(), limitConfig.ttlMs);
  }

  private async applyBackoff(failCount: number): Promise<void> {
    if (failCount < 3) {
      return;
    }

    const delayMs = Math.min(1000, 200 * Math.pow(2, failCount - 3));
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private failKey(email: string): string {
    return `auth_fail:${email}`;
  }

  private captchaKey(email: string): string {
    return `auth_captcha:${email}`;
  }

  private lockKey(email: string): string {
    return `auth_lock:${email}`;
  }

  private actionKey(action: string, email: string): string {
    return `auth_action:${action}:${email}`;
  }
}
