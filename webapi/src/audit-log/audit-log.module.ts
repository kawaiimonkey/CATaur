import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '../database/entities/audit-log.entity';
import { AuditLogService } from './audit-log.service';
import { AuditLogInterceptor } from '../common/interceptors/audit-log.interceptor';
import { CommonModule } from '../common/common.module';

import { APP_INTERCEPTOR } from '@nestjs/core';

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([AuditLog]),
        CommonModule, // For UlidService
    ],
    providers: [
        AuditLogService,
        AuditLogInterceptor,
        {
            provide: APP_INTERCEPTOR,
            useClass: AuditLogInterceptor,
        },
    ],
    exports: [
        AuditLogService,
        AuditLogInterceptor,
    ],
})
export class AuditLogModule { }
