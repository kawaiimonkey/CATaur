import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from '../database/entities/application.entity';
import { JobOrder } from '../database/entities/job-order.entity';
import { User } from '../database/entities/user.entity';
import { ApplicationsService } from './applications.service';
import { CommonModule } from '../common/common.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Application, JobOrder, User]),
        CommonModule,
        NotificationsModule,
    ],
    providers: [ApplicationsService],
    exports: [ApplicationsService],
})
export class ApplicationsModule {}
