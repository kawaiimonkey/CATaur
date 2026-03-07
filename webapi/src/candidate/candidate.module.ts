import { Module } from '@nestjs/common';
import { CandidateController } from './candidate.controller';
import { JobOrdersModule } from '../job-orders/job-orders.module';
import { ApplicationsModule } from '../applications/applications.module';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [JobOrdersModule, ApplicationsModule, UsersModule],
    controllers: [CandidateController],
})
export class CandidateModule {}
