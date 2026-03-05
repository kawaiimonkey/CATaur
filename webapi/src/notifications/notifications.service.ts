import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../database/entities/notification.entity';
import { UlidService } from '../common/ulid.service';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification)
        private repo: Repository<Notification>,
        private ulidService: UlidService,
    ) {}

    async findAll(userId: string) {
        return this.repo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: 50,
        });
    }

    async create(
        userId: string,
        type: string,
        title: string,
        body: string,
        refId?: string,
    ): Promise<Notification> {
        const notification = this.repo.create({
            id: this.ulidService.generate(),
            userId,
            type,
            title,
            body,
            isRead: false,
            refId: refId ?? null,
        });
        return this.repo.save(notification);
    }

    async markAllRead(userId: string): Promise<void> {
        await this.repo.update({ userId, isRead: false }, { isRead: true });
    }
}
