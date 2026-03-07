import {
    Controller, Get, Post, Put, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequireRoles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/user.decorator';
import { Role } from '../database/entities/user-role.entity';
import { User } from '../database/entities/user.entity';
import { JobOrdersService } from '../job-orders/job-orders.service';
import { ApplicationsService } from '../applications/applications.service';
import { CreateApplicationDto } from '../applications/dto/application.dto';
import { UpdateUserProfileDto } from '../users/dto/update-user-profile.dto';
import { UsersService } from '../users/users.service';

@ApiTags('candidate')
@Controller('candidate')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles(Role.CANDIDATE)
@ApiBearerAuth()
export class CandidateController {
    constructor(
        private jobOrdersService: JobOrdersService,
        private applicationsService: ApplicationsService,
        private usersService: UsersService,
    ) {}

    // ── Public Job Board ──────────────────────────────────────────────────
    @Get('jobs')
    @ApiOperation({ summary: 'Browse open job orders' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    listJobs(
        @Query('page') page = '1',
        @Query('limit') limit = '20',
        @Query('search') search?: string,
    ) {
        // Candidates see only active (sourcing/interview) positions
        return this.jobOrdersService.findAll({}, {
            page: +page, limit: +limit, search,
            status: undefined,  // JobOrdersService will filter; we pass no companyId/assignedTo scope
        });
    }

    @Get('jobs/:id')
    @ApiOperation({ summary: 'Get job order detail' })
    getJob(@Param('id') id: string) {
        return this.jobOrdersService.findOne(id);
    }

    // ── Applications ──────────────────────────────────────────────────────
    @Post('jobs/:id/apply')
    @ApiOperation({ summary: 'Apply to a job order' })
    apply(@GetUser() user: User, @Param('id') jobOrderId: string) {
        const dto: CreateApplicationDto = { jobOrderId, candidateId: user.id };
        return this.applicationsService.create(dto, 'self_applied');
    }

    @Get('applications')
    @ApiOperation({ summary: "Get my applications" })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    myApplications(
        @GetUser() user: User,
        @Query('page') page = '1',
        @Query('limit') limit = '20',
    ) {
        // Candidate scope: only their own applications
        return this.applicationsService.findAll(
            {},
            { page: +page, limit: +limit },
        ).then(result => ({
            ...result,
            data: result.data.filter(a => a.candidateId === user.id),
        }));
    }

    // ── Profile ───────────────────────────────────────────────────────────
    @Get('profile')
    @ApiOperation({ summary: 'Get my profile' })
    getProfile(@GetUser() user: User) {
        return this.usersService.findOneById(user.id);
    }

    @Put('profile')
    @ApiOperation({ summary: 'Update my profile' })
    updateProfile(@GetUser() user: User, @Body() dto: UpdateUserProfileDto) {
        return this.usersService.update(user.id, dto);
    }
}
