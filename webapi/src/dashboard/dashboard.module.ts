import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobOrder } from '../database/entities/job-order.entity';
import { Application } from '../database/entities/application.entity';
import { User } from '../database/entities/user.entity';
import { Company } from '../database/entities/company.entity';
import { DashboardService } from './dashboard.service';

@Module({
    imports: [TypeOrmModule.forFeature([JobOrder, Application, User, Company])],
    providers: [DashboardService],
    exports: [DashboardService],
})
export class DashboardModule {}
