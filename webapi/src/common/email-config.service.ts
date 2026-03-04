import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { EmailConfigDto } from './dto/email-config.dto';

const EMAIL_CONFIG_CACHE_KEY = 'system:email:config';

@Injectable()
export class EmailConfigService {
    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) { }

    async getEmailConfig(): Promise<EmailConfigDto | null> {
        const config = await this.cacheManager.get<EmailConfigDto>(EMAIL_CONFIG_CACHE_KEY);
        return config ?? null;
    }

    async setEmailConfig(config: EmailConfigDto): Promise<EmailConfigDto> {
        await this.cacheManager.set(EMAIL_CONFIG_CACHE_KEY, config, 0);
        return config;
    }
}
