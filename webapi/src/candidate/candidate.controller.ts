import {
    Controller, Get, Post, Put, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiExtraModels, ApiOkResponse, ApiProperty } from '@nestjs/swagger';
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
import { CandidateResumeService } from './candidate-resume.service';
import { ParseResumeDto } from './dto/parse-resume.dto';
import { ApplyResumeDto } from './dto/apply-resume.dto';
import { createPaginatedResponseDto, PaginatedResponse } from '../common/dto/paginated-response.dto';
import { JobOrder } from '../database/entities/job-order.entity';
import { Application } from '../database/entities/application.entity';
import { createApiResponseDto } from '../common/dto/api-response.dto';
import { Candidate } from '../database/entities/candidate.entity';

class ResumeParseResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    candidateId: string;

    @ApiProperty({ required: false, type: String })
    resumeUrl: string | null;

    @ApiProperty()
    status: string;

    @ApiProperty({ required: false, type: Number })
    confidence: number | null;

    @ApiProperty({ type: String, format: 'date-time' })
    parseDate: Date;

    @ApiProperty({ type: [String] })
    warnings: string[];

    @ApiProperty({ required: false, type: String })
    rawTextPreview: string | null;

    @ApiProperty({ required: false, type: Object })
    parsedData: Record<string, unknown> | null;
}

class ResumeApplyResponseDto {
    @ApiProperty({ type: Candidate })
    candidate: Candidate;

    @ApiProperty({ type: ResumeParseResponseDto })
    parser: ResumeParseResponseDto;
}

class LatestResumeResponseDto {
    @ApiProperty({ type: Candidate })
    candidate: Candidate;

    @ApiProperty({ type: ResumeParseResponseDto, required: false })
    latestResume: ResumeParseResponseDto | null;
}

const PaginatedJobOrdersResponseDto = createPaginatedResponseDto(JobOrder);
const PaginatedApplicationsResponseDto = createPaginatedResponseDto(Application);
const JobOrderResponseDto = createApiResponseDto(JobOrder);
const ApplicationResponseDto = createApiResponseDto(Application);
const ProfileResponseDto = createApiResponseDto(User);

@ApiTags('candidate')
@ApiExtraModels(
    PaginatedJobOrdersResponseDto,
    PaginatedApplicationsResponseDto,
    JobOrder,
    Application,
    User,
    Candidate,
    JobOrderResponseDto,
    ApplicationResponseDto,
    ProfileResponseDto,
    ResumeParseResponseDto,
    ResumeApplyResponseDto,
    LatestResumeResponseDto,
)
@Controller('candidate')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles(Role.CANDIDATE)
@ApiBearerAuth()
export class CandidateController {
    constructor(
        private jobOrdersService: JobOrdersService,
        private applicationsService: ApplicationsService,
        private usersService: UsersService,
        private candidateResumeService: CandidateResumeService,
    ) {}

    @Get('jobs')
    @ApiOperation({ summary: 'Browse open job orders' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiOkResponse({ type: PaginatedJobOrdersResponseDto })
    listJobs(
        @Query('page') page = '1',
        @Query('limit') limit = '20',
        @Query('search') search?: string,
    ): Promise<PaginatedResponse<JobOrder>> {
        return this.jobOrdersService.findAll({}, {
            page: +page,
            limit: +limit,
            search,
            statuses: ['sourcing', 'interview'],
        });
    }

    @Get('jobs/:id')
    @ApiOperation({ summary: 'Get job order detail' })
    @ApiOkResponse({ type: JobOrderResponseDto })
    getJob(@Param('id') id: string): Promise<JobOrder> {
        return this.jobOrdersService.findOne(id);
    }

    @Post('jobs/:id/apply')
    @ApiOperation({ summary: 'Apply to a job order' })
    @ApiOkResponse({ type: ApplicationResponseDto })
    apply(@GetUser() user: User, @Param('id') jobOrderId: string): Promise<Application> {
        const dto: CreateApplicationDto = { jobOrderId, candidateId: user.id };
        return this.applicationsService.create(dto, 'self_applied');
    }

    @Get('applications')
    @ApiOperation({ summary: 'Get my applications' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiOkResponse({ type: PaginatedApplicationsResponseDto })
    myApplications(
        @GetUser() user: User,
        @Query('page') page = '1',
        @Query('limit') limit = '20',
    ): Promise<PaginatedResponse<Application>> {
        return this.applicationsService.findAll(
            { candidateId: user.id },
            { page: +page, limit: +limit },
        );
    }

    @Get('profile')
    @ApiOperation({ summary: 'Get my profile' })
    @ApiOkResponse({ type: ProfileResponseDto })
    getProfile(@GetUser() user: User): Promise<User | null> {
        return this.usersService.findOneById(user.id);
    }

    @Put('profile')
    @ApiOperation({ summary: 'Update my profile' })
    @ApiOkResponse({ type: ProfileResponseDto })
    updateProfile(@GetUser() user: User, @Body() dto: UpdateUserProfileDto): Promise<User> {
        return this.usersService.update(user.id, dto);
    }

    @Post('resume/parse')
    @ApiOperation({ summary: 'Parse a resume and store encrypted parsed_data' })
    @ApiOkResponse({ type: ResumeParseResponseDto })
    parseResume(@GetUser() user: User, @Body() dto: ParseResumeDto): Promise<ResumeParseResponseDto> {
        return this.candidateResumeService.parseResume(user.id, dto);
    }

    @Post('resume/apply')
    @ApiOperation({ summary: 'Apply one parsed resume as the current candidate profile snapshot' })
    @ApiOkResponse({ type: ResumeApplyResponseDto })
    applyResume(@GetUser() user: User, @Body() dto: ApplyResumeDto): Promise<ResumeApplyResponseDto> {
        return this.candidateResumeService.applyParsedResume(user.id, dto);
    }

    @Get('resume/latest')
    @ApiOperation({ summary: 'Get the latest parsed resume for the current candidate' })
    @ApiOkResponse({ type: LatestResumeResponseDto })
    getLatestResume(@GetUser() user: User): Promise<LatestResumeResponseDto> {
        return this.candidateResumeService.getLatestResume(user.id);
    }

    @Get('resume/parses/:id')
    @ApiOperation({ summary: 'Get a parsed resume by ID for the current candidate' })
    @ApiOkResponse({ type: ResumeParseResponseDto })
    getResumeParse(@GetUser() user: User, @Param('id') parserId: string): Promise<ResumeParseResponseDto> {
        return this.candidateResumeService.getResumeParse(user.id, parserId);
    }
}
