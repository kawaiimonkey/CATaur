import { Global, Module } from '@nestjs/common';
import { UlidService } from './ulid.service';
import { EmailService } from './email.service';
import { EmailConfigService } from './email-config.service';
import { EncryptionService } from './encryption.service';

@Global()
@Module({
    providers: [UlidService, EmailService, EmailConfigService, EncryptionService],
    exports: [UlidService, EmailService, EmailConfigService, EncryptionService],
})
export class CommonModule { }
