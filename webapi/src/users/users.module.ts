import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { UsersService } from './users.service';
import { UsersCleanupTask } from './tasks/cleanup.task';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    providers: [UsersService, UsersCleanupTask],
    exports: [UsersService],
})
export class UsersModule { }
