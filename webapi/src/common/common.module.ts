import { Global, Module } from '@nestjs/common';
import { UlidService } from './ulid.service';
import { EmailService } from './email.service';

@Global()
@Module({
    providers: [UlidService, EmailService],
    exports: [UlidService, EmailService],
})
export class CommonModule { }
