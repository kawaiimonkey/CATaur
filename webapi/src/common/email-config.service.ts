import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { EmailConfigDto } from './dto/email-config.dto';
import { EncryptionService } from './encryption.service';

const EMAIL_CONFIG_CACHE_KEY = 'system:email:config';

@Injectable()
export class EmailConfigService {
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private readonly encryptionService: EncryptionService,
    ) { }

    async getEmailConfig(): Promise<EmailConfigDto> {
        const encrypted = await this.cacheManager.get<Buffer>(EMAIL_CONFIG_CACHE_KEY);
        if (encrypted) {
            return this.encryptionService.decryptJson<EmailConfigDto>(encrypted);
        }

        // Return default configuration if not set
        return {
            host: 'smtp.gmail.com',
            port: 587,
            auth: {
                user: 'big.test.free@gmail.com',
                pass: 'axbc fhdp oksu acyg',
            },
            emailFrom: 'big.test.free@gmail.com',
            fromName: 'CATaur System',
        };
    }

    async setEmailConfig(config: EmailConfigDto): Promise<EmailConfigDto> {
        const encrypted = this.encryptionService.encryptJson(config);
        await this.cacheManager.set(EMAIL_CONFIG_CACHE_KEY, encrypted, 0);
        return config;
    }
}
