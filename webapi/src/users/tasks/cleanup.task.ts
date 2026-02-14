import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { User } from '../../database/entities/user.entity';

@Injectable()
export class UsersCleanupTask {
    private readonly logger = new Logger(UsersCleanupTask.name);

    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleCleanup() {
        this.logger.log('Starting unactivated users cleanup...');

        // Delete users who are not active and created more than 24 hours ago
        const expirationDate = new Date();
        expirationDate.setHours(expirationDate.getHours() - 24);

        const result = await this.usersRepository.delete({
            isActive: false,
            createdAt: LessThan(expirationDate),
        });

        this.logger.log(`Cleanup complete. Removed ${result.affected} unactivated users.`);
    }
}
