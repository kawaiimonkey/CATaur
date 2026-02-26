import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class CaptchaService {
  constructor(private configService: ConfigService) {}

  async verifyToken(token: string, ip?: string): Promise<boolean> {
    const verifyUrl = this.configService.get<string>('CAPTCHA_VERIFY_URL');
    const secret = this.configService.get<string>('CAPTCHA_SECRET');

    if (!verifyUrl || !secret) {
      return false;
    }

    const payload = new URLSearchParams({
      secret,
      response: token,
    });

    if (ip) {
      payload.set('remoteip', ip);
    }

    try {
      const response = await axios.post(verifyUrl, payload.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 5000,
      });

      return Boolean(response.data?.success);
    } catch {
      return false;
    }
  }
}
