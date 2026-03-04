import { Global, Module } from '@nestjs/common';
import { UlidService } from './ulid.service';
import { EmailService } from './email.service';
import { EmailConfigService } from './email-config.service';

@Global()
@Module({
    providers: [UlidService, EmailService, EmailConfigService],
    exports: [UlidService, EmailService, EmailConfigService],
})
export class CommonModule { }
