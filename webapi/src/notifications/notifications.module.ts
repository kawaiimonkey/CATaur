import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from '../database/entities/notification.entity';
import { NotificationsService } from './notifications.service';
import { CommonModule } from '../common/common.module';

@Module({
    imports: [TypeOrmModule.forFeature([Notification]), CommonModule],
    providers: [NotificationsService],
    exports: [NotificationsService],
})
export class NotificationsModule {}
