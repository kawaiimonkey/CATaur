import {
    Controller, Get, Post, Put, Patch,
    Body, Param, Query, UseGuards, HttpCode, HttpStatus,
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
import { NotificationsService } from '../notifications/notifications.service';
import { AdminService } from '../admin/admin.service';
import { CreateJobOrderDto } from '../job-orders/dto/create-job-order.dto';
import { UpdateJobOrderDto, UpdateJobOrderStatusDto } from '../job-orders/dto/update-job-order.dto';
import {
    CreateApplicationDto,
    UpdateApplicationStatusDto,
    BulkImportDto,
} from '../applications/dto/application.dto';
import { ReportsService } from '../reports/reports.service';
import { DashboardService } from '../dashboard/dashboard.service';
import { AuditLog } from '../common/decorators/audit-log.decorator';
import { CreateCompanyDto } from '../admin/dto/create-company.dto';
import { UpdateCompanyDto } from '../admin/dto/update-company.dto';
import { UpdateRecruiterCandidateDto } from './dto/update-recruiter-candidate.dto';


@ApiTags('recruiter')
@Controller('recruiter')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles(Role.RECRUITER)
@ApiBearerAuth()
export class RecruiterController {
    constructor(
        private jobOrdersService: JobOrdersService,
        private applicationsService: ApplicationsService,
        private notificationsService: NotificationsService,
        private adminService: AdminService,
        private reportsService: ReportsService,
        private dashboardService: DashboardService,
    ) {}

    // ── Job Orders ────────────────────────────────────────────────────────
    @Get('job-orders')
    @ApiOperation({ summary: 'List my job orders' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'status', required: false })
    @ApiQuery({ name: 'search', required: false })
    listJobOrders(
        @GetUser() user: User,
        @Query('page') page = '1',
        @Query('limit') limit = '20',
        @Query('status') status?: string,
        @Query('search') search?: string,
    ) {
        return this.jobOrdersService.findAll(
            { assignedToId: user.id },
            { page: +page, limit: +limit, status, search },
        );
    }

    @Post('job-orders')
    @AuditLog('create job order')
    @ApiOperation({ summary: 'Create a job order (assigned to me)' })
    createJobOrder(@GetUser() user: User, @Body() dto: CreateJobOrderDto) {
        return this.jobOrdersService.create(dto, user.id);
    }

    @Get('job-orders/:id')
    @ApiOperation({ summary: 'Get a job order by ID (must be mine)' })
    getJobOrder(@GetUser() user: User, @Param('id') id: string) {
        return this.jobOrdersService.findOne(id, { assignedToId: user.id });
    }

    @Put('job-orders/:id')
    @AuditLog('update job order')
    @ApiOperation({ summary: 'Update a job order (must be mine)' })
    updateJobOrder(
        @GetUser() user: User,
        @Param('id') id: string,
        @Body() dto: UpdateJobOrderDto,
    ) {
        return this.jobOrdersService.update(id, dto, { assignedToId: user.id });
    }

    @Patch('job-orders/:id/status')
    @AuditLog('update job order status')
    @ApiOperation({ summary: 'Update job order status (must be mine)' })
    updateJobOrderStatus(
        @GetUser() user: User,
        @Param('id') id: string,
        @Body() dto: UpdateJobOrderStatusDto,
    ) {
        return this.jobOrdersService.updateStatus(id, dto.status, { assignedToId: user.id });
    }

    // ── Applications ──────────────────────────────────────────────────────
    @Get('applications')
    @ApiOperation({ summary: 'List applications for my job orders' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'status', required: false })
    @ApiQuery({ name: 'jobOrderId', required: false })
    @ApiQuery({ name: 'search', required: false })
    listApplications(
        @GetUser() user: User,
        @Query('page') page = '1',
        @Query('limit') limit = '20',
        @Query('status') status?: string,
        @Query('jobOrderId') jobOrderId?: string,
        @Query('search') search?: string,
    ) {
        return this.applicationsService.findAll(
            { assignedToId: user.id },
            { page: +page, limit: +limit, status, jobOrderId, search },
        );
    }

    @Get('applications/:id')
    @ApiOperation({ summary: 'Get an application by ID (must belong to my job order)' })
    getApplication(@GetUser() user: User, @Param('id') id: string) {
        return this.applicationsService.findOne(id, { assignedToId: user.id });
    }

    @Post('applications')
    @AuditLog('create application')
    @ApiOperation({ summary: 'Manually add a candidate to a job order' })
    createApplication(@Body() dto: CreateApplicationDto) {
        return this.applicationsService.create(dto, 'recruiter_import');
    }

    @Patch('applications/:id/status')
    @AuditLog('update application status')
    @ApiOperation({ summary: 'Update application status (triggers email on interview/offer)' })
    updateApplicationStatus(
        @GetUser() user: User,
        @Param('id') id: string,
        @Body() dto: UpdateApplicationStatusDto,
    ) {
        return this.applicationsService.updateStatus(id, dto, { assignedToId: user.id });
    }

    // ── Candidates ────────────────────────────────────────────────────────
    @Get('candidates')
    @ApiOperation({ summary: 'List candidates for my assigned job orders' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'status', required: false })
    @ApiQuery({ name: 'jobOrderId', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiQuery({ name: 'location', required: false })
    listCandidates(
        @GetUser() user: User,
        @Query('page') page = '1',
        @Query('limit') limit = '20',
        @Query('status') status?: string,
        @Query('jobOrderId') jobOrderId?: string,
        @Query('search') search?: string,
        @Query('location') location?: string,
    ) {
        return this.applicationsService.findRecruiterCandidates(user.id, {
            page: +page,
            limit: +limit,
            status,
            jobOrderId,
            search,
            location,
        });
    }

    @Get('candidates/:id')
    @ApiOperation({ summary: 'Get candidate application detail (must belong to my job order)' })
    getCandidate(@GetUser() user: User, @Param('id') id: string) {
        return this.applicationsService.findRecruiterCandidateById(user.id, id);
    }

    @Put('candidates/:id')
    @AuditLog('update candidate')
    @ApiOperation({ summary: 'Update candidate profile fields and application fields' })
    updateCandidate(
        @GetUser() user: User,
        @Param('id') id: string,
        @Body() dto: UpdateRecruiterCandidateDto,
    ) {
        return this.applicationsService.updateRecruiterCandidate(user.id, id, dto);
    }

    @Post('candidates/import')
    @AuditLog('bulk import candidates')
    @ApiOperation({ summary: 'Bulk-import candidates into a job order' })
    bulkImport(@Body() dto: BulkImportDto) {
        return this.applicationsService.bulkImport(dto);
    }

    // ── Companies ──────────────────────────────────────────────────────────
    @Get('companies')
    @ApiOperation({ summary: 'List companies' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    listCompanies(
        @Query('page') page = '1',
        @Query('limit') limit = '10',
        @Query('search') search?: string,
    ) {
        return this.adminService.listCompanies(+page, +limit, search);
    }

    @Get('companies/:id')
    @ApiOperation({ summary: 'Get company details by ID' })
    getCompanyById(@Param('id') id: string) {
        return this.adminService.getCompanyById(id);
    }

    @Post('companies')
    @AuditLog('create company')
    @ApiOperation({ summary: 'Create a company' })
    createCompany(@Body() dto: CreateCompanyDto) {
        return this.adminService.createCompany(dto);
    }

    @Put('companies/:id')
    @AuditLog('update company')
    @ApiOperation({ summary: 'Update a company' })
    updateCompany(@Param('id') id: string, @Body() dto: UpdateCompanyDto) {
        return this.adminService.updateCompany(id, dto);
    }

    // ── Notifications ─────────────────────────────────────────────────────
    @Get('notifications')
    @ApiOperation({ summary: 'Get my notifications' })
    getNotifications(@GetUser() user: User) {
        return this.notificationsService.findAll(user.id);
    }

    @Patch('notifications/read-all')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Mark all notifications as read' })
    markAllRead(@GetUser() user: User) {
        return this.notificationsService.markAllRead(user.id);
    }

    // ── Reports ───────────────────────────────────────────────────
    @Get('reports/job-orders')
    @ApiOperation({ summary: 'Job order stats for my assigned orders' })
    reportJobOrders(@GetUser() user: User) {
        return this.reportsService.getJobOrderStats({ assignedToId: user.id });
    }

    @Get('reports/applications')
    @ApiOperation({ summary: 'Application stats for my job orders' })
    reportApplications(@GetUser() user: User) {
        return this.reportsService.getApplicationStats({ assignedToId: user.id });
    }

    @Get('reports/top-job-orders')
    @ApiOperation({ summary: 'My top job orders by application volume' })
    @ApiQuery({ name: 'limit', required: false })
    reportTopJobOrders(@GetUser() user: User, @Query('limit') limit = '5') {
        return this.reportsService.getTopJobOrders({ assignedToId: user.id }, +limit);
    }

    @Get('reports/activity')
    @ApiOperation({ summary: 'My daily activity timeline' })
    @ApiQuery({ name: 'days', required: false })
    reportActivity(@GetUser() user: User, @Query('days') days = '30') {
        return this.reportsService.getActivityTimeline({ assignedToId: user.id }, +days);
    }

    // ── Dashboard ─────────────────────────────────────────────────
    @Get('dashboard')
    @ApiOperation({ summary: 'Recruiter dashboard KPIs' })
    dashboard(@GetUser() user: User) {
        return this.dashboardService.getRecruiterDashboard(user.id);
    }
}
