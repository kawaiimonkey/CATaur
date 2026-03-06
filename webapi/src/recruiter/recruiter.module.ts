import { Module } from '@nestjs/common';
import { RecruiterController } from './recruiter.controller';
import { JobOrdersModule } from '../job-orders/job-orders.module';
import { ApplicationsModule } from '../applications/applications.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AdminModule } from '../admin/admin.module';
import { ReportsModule } from '../reports/reports.module';
import { DashboardModule } from '../dashboard/dashboard.module';

@Module({
    imports: [JobOrdersModule, ApplicationsModule, NotificationsModule, AdminModule, ReportsModule, DashboardModule],
    controllers: [RecruiterController],
})
export class RecruiterModule {}
