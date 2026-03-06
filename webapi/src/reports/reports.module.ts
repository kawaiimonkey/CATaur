import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobOrder } from '../database/entities/job-order.entity';
import { Application } from '../database/entities/application.entity';
import { ReportsService } from './reports.service';

@Module({
    imports: [TypeOrmModule.forFeature([JobOrder, Application])],
    providers: [ReportsService],
    exports: [ReportsService],
})
export class ReportsModule {}
