import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientController } from './client.controller';
import { JobOrdersModule } from '../job-orders/job-orders.module';
import { ApplicationsModule } from '../applications/applications.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ReportsModule } from '../reports/reports.module';
import { DashboardModule } from '../dashboard/dashboard.module';
import { Company } from '../database/entities/company.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Company]),
        JobOrdersModule,
        ApplicationsModule,
        NotificationsModule,
        ReportsModule,
        DashboardModule,
    ],
    controllers: [ClientController],
})
export class ClientModule {}
