import {
    Controller, Get, Patch, Body, Param, Query, UseGuards, HttpCode, HttpStatus,
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
import { SubmitDecisionDto } from '../applications/dto/application.dto';
import { AdminService } from '../admin/admin.service';

@ApiTags('client')
@Controller('client')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles(Role.CLIENT)
@ApiBearerAuth()
export class ClientController {
    constructor(
        private jobOrdersService: JobOrdersService,
        private applicationsService: ApplicationsService,
        private notificationsService: NotificationsService,
        private adminService: AdminService,
    ) {}

    /** Resolve all company IDs this client user belongs to */
    private async getCompanyIds(user: User): Promise<string[]> {
        // Companies where clientId = this user
        const result = await this.adminService.listCompanies(1, 100);
        return result.data
            .filter((c: any) => c.clientId === user.id)
            .map((c: any) => c.id);
    }

    // ── Orders ────────────────────────────────────────────────────────────
    @Get('orders')
    @ApiOperation({ summary: "List this client's job orders" })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'status', required: false })
    async listOrders(
        @GetUser() user: User,
        @Query('page') page = '1',
        @Query('limit') limit = '20',
        @Query('status') status?: string,
    ) {
        const companyIds = await this.getCompanyIds(user);
        if (!companyIds.length) return { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
        // Use the first companyId (clients typically belong to one company)
        return this.jobOrdersService.findAll({ companyId: companyIds[0] as any }, {
            page: +page, limit: +limit, status,
        });
    }

    @Get('orders/:id')
    @ApiOperation({ summary: "Get a job order's details" })
    async getOrder(@GetUser() user: User, @Param('id') id: string) {
        const companyIds = await this.getCompanyIds(user);
        // findOne will throw 404 if the job order doesn't belong to this company
        const jo = await this.jobOrdersService.findOne(id);
        if (!companyIds.includes(jo.companyId ?? '')) {
            throw new Error('Not found');
        }
        return jo;
    }

    // ── Candidates (applications for client's orders) ─────────────────────
    @Get('candidates')
    @ApiOperation({ summary: "List candidates for this client's orders" })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'status', required: false })
    @ApiQuery({ name: 'jobOrderId', required: false })
    async listCandidates(
        @GetUser() user: User,
        @Query('page') page = '1',
        @Query('limit') limit = '20',
        @Query('status') status?: string,
        @Query('jobOrderId') jobOrderId?: string,
    ) {
        const companyIds = await this.getCompanyIds(user);
        return this.applicationsService.findAll({ companyIds }, {
            page: +page, limit: +limit, status, jobOrderId,
        });
    }

    @Get('candidates/:id')
    @ApiOperation({ summary: "Get candidate application detail" })
    async getCandidate(@GetUser() user: User, @Param('id') id: string) {
        const companyIds = await this.getCompanyIds(user);
        return this.applicationsService.findOne(id, { companyIds });
    }

    @Patch('candidates/:id/decision')
    @ApiOperation({ summary: 'Submit a hiring decision (request-offer / pass / hold)' })
    async submitDecision(
        @GetUser() user: User,
        @Param('id') id: string,
        @Body() dto: SubmitDecisionDto,
    ) {
        const companyIds = await this.getCompanyIds(user);
        return this.applicationsService.submitDecision(id, dto, companyIds);
    }

    // ── Notifications ─────────────────────────────────────────────────────
    @Get('notifications')
    @ApiOperation({ summary: 'Get notifications' })
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
