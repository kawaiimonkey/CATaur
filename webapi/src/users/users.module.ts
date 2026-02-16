import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { UserRole } from '../database/entities/user-role.entity';
import { UsersService } from './users.service';
import { UsersCleanupTask } from './tasks/cleanup.task';

import { UsersController } from './users.controller';

@Module({
    imports: [TypeOrmModule.forFeature([User, UserRole])],
    controllers: [UsersController],
    providers: [UsersService, UsersCleanupTask],
    exports: [UsersService],
})
export class UsersModule { }
