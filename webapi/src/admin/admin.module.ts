import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../database/entities/user.entity';
import { UserRole } from '../database/entities/user-role.entity';
import { Company } from '../database/entities/company.entity';
import { SystemConfig } from '../database/entities/system-config.entity';
import { AuditLog } from '../database/entities/audit-log.entity';
import { UsersModule } from '../users/users.module';
import { CommonModule } from '../common/common.module';
import { AIProviderConfigService } from './services/ai-provider-config.service';
import { JobOrdersModule } from '../job-orders/job-orders.module';
import { ApplicationsModule } from '../applications/applications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserRole, Company, SystemConfig, AuditLog]),
    UsersModule,
    CommonModule,
    JobOrdersModule,
    ApplicationsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, AIProviderConfigService],
  exports: [AdminService, AIProviderConfigService],
})
export class AdminModule {}

