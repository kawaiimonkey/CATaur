import {
    Controller, Get, Post, Put, Patch, Delete,
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

/** Builds the scope for recruiter-owned data. Admin users see everything. */
function recruiterScope(user: User) {
    const isAdmin = user.roles?.some(r => r.role === Role.ADMIN);
    return isAdmin ? {} : { assignedToId: user.id };
}

@ApiTags('recruiter')
@Controller('recruiter')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles(Role.RECRUITER, Role.ADMIN)
@ApiBearerAuth()
export class RecruiterController {
    constructor(
        private jobOrdersService: JobOrdersService,
        private applicationsService: ApplicationsService,
        private notificationsService: NotificationsService,
        private adminService: AdminService,
    ) {}

    // ── Job Orders ────────────────────────────────────────────────────────
    @Get('job-orders')
    @ApiOperation({ summary: 'List job orders' })
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
        return this.jobOrdersService.findAll(recruiterScope(user), {
            page: +page, limit: +limit, status, search,
        });
    }

    @Post('job-orders')
    @ApiOperation({ summary: 'Create a job order' })
    createJobOrder(@GetUser() user: User, @Body() dto: CreateJobOrderDto) {
        return this.jobOrdersService.create(dto, user.id);
    }

    @Get('job-orders/:id')
    @ApiOperation({ summary: 'Get a job order by ID' })
    getJobOrder(@GetUser() user: User, @Param('id') id: string) {
        return this.jobOrdersService.findOne(id, recruiterScope(user));
    }

    @Put('job-orders/:id')
    @ApiOperation({ summary: 'Update a job order' })
    updateJobOrder(
        @GetUser() user: User,
        @Param('id') id: string,
        @Body() dto: UpdateJobOrderDto,
    ) {
        return this.jobOrdersService.update(id, dto, recruiterScope(user));
    }

    @Patch('job-orders/:id/status')
    @ApiOperation({ summary: 'Update job order status' })
    updateJobOrderStatus(
        @GetUser() user: User,
        @Param('id') id: string,
        @Body() dto: UpdateJobOrderStatusDto,
    ) {
        return this.jobOrdersService.updateStatus(id, dto.status, recruiterScope(user));
    }

    @Delete('job-orders/:id')
    @RequireRoles(Role.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a job order (Admin only)' })
    deleteJobOrder(@Param('id') id: string) {
        return this.jobOrdersService.delete(id);
    }

    // ── Applications ──────────────────────────────────────────────────────
    @Get('applications')
    @ApiOperation({ summary: 'List applications' })
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
        return this.applicationsService.findAll(recruiterScope(user), {
            page: +page, limit: +limit, status, jobOrderId, search,
        });
    }

    @Get('applications/:id')
    @ApiOperation({ summary: 'Get an application by ID' })
    getApplication(@GetUser() user: User, @Param('id') id: string) {
        return this.applicationsService.findOne(id, recruiterScope(user));
    }

    @Post('applications')
    @ApiOperation({ summary: 'Manually add a candidate to a job order' })
    createApplication(@Body() dto: CreateApplicationDto) {
        return this.applicationsService.create(dto, 'recruiter_import');
    }

    @Patch('applications/:id/status')
    @ApiOperation({ summary: 'Update application status (triggers email on interview/offer)' })
    updateApplicationStatus(
        @GetUser() user: User,
        @Param('id') id: string,
        @Body() dto: UpdateApplicationStatusDto,
    ) {
        return this.applicationsService.updateStatus(id, dto, recruiterScope(user));
    }

    @Delete('applications/:id')
    @RequireRoles(Role.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete an application (Admin only)' })
    deleteApplication(@Param('id') id: string) {
        return this.applicationsService.delete(id);
    }

    // ── Candidates (shorthand — applications list grouped by candidate) ────
    @Post('candidates/import')
    @ApiOperation({ summary: 'Bulk-import candidates from CSV data' })
    bulkImport(@Body() dto: BulkImportDto) {
        return this.applicationsService.bulkImport(dto);
    }

    // ── Companies (read-only, reuses AdminService) ────────────────────────
    @Get('companies')
    @ApiOperation({ summary: 'List companies (read-only)' })
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

    // ── Notifications ─────────────────────────────────────────────────────
    @Get('notifications')
    @ApiOperation({ summary: 'Get notifications for current user' })
    getNotifications(@GetUser() user: User) {
        return this.notificationsService.findAll(user.id);
    }

    @Patch('notifications/read-all')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Mark all notifications as read' })
    markAllRead(@GetUser() user: User) {
        return this.notificationsService.markAllRead(user.id);
    }
}
