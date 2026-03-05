import { Module } from '@nestjs/common';
import { RecruiterController } from './recruiter.controller';
import { JobOrdersModule } from '../job-orders/job-orders.module';
import { ApplicationsModule } from '../applications/applications.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AdminModule } from '../admin/admin.module';

@Module({
    imports: [JobOrdersModule, ApplicationsModule, NotificationsModule, AdminModule],
    controllers: [RecruiterController],
})
export class RecruiterModule {}
