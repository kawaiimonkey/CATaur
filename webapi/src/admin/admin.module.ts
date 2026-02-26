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
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ActivityInterceptor } from './activity.interceptor';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserRole, Company, SystemConfig, AuditLog]),
    UsersModule,
    CommonModule,
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ActivityInterceptor,
    }
  ],
  exports: [AdminService],
})
export class AdminModule {}
