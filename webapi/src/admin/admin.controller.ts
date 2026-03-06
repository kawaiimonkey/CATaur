import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import { PaginatedUsersResponseDto } from './dto/user-list-response.dto';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequireRoles } from '../auth/decorators/roles.decorator';
import { Role } from '../database/entities/user-role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { AuditLog } from '../common/decorators/audit-log.decorator';
import { PaginatedAuditLogResponseDto } from './dto/audit-log-response.dto';
import { EmailConfigDto } from '../common/dto/email-config.dto';
import { SendTestEmailDto } from './dto/send-test-email.dto';
import { AIProviderConfigDto, AIProviderResponseDto, AIProvider, AIProvidersListResponseDto } from './dto/ai-provider.dto';
import { JobOrdersService } from '../job-orders/job-orders.service';
import { ApplicationsService } from '../applications/applications.service';
import { CreateJobOrderDto } from '../job-orders/dto/create-job-order.dto';
import { UpdateJobOrderDto, UpdateJobOrderStatusDto } from '../job-orders/dto/update-job-order.dto';
import { CreateApplicationDto, UpdateApplicationStatusDto } from '../applications/dto/application.dto';
import { GetUser } from '../auth/decorators/user.decorator';
import { User } from '../database/entities/user.entity';


@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles(Role.ADMIN)
@ApiBearerAuth()
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
        private readonly jobOrdersService: JobOrdersService,
        private readonly applicationsService: ApplicationsService,
    ) { }

    // --- Module 1: Users Management ---

    @Get('users')
    @ApiOperation({ summary: 'List all users (Paginated)' })
    @ApiResponse({ status: 200, type: PaginatedUsersResponseDto })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'role', required: false, enum: Role })
    @ApiQuery({ name: 'search', required: false, type: String })
    async listUsers(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
        @Query('role') role?: Role,
        @Query('search') search?: string,
    ): Promise<PaginatedUsersResponseDto> {
        return await this.adminService.listUsers(Number(page), Number(limit), role, search);
    }

    @Post('users')
    @AuditLog('create user')
    @ApiOperation({ summary: 'Create a new user' })
    async createUser(@Body() createUserDto: CreateUserDto) {
        await this.adminService.createUser(createUserDto);
    }

    @Put('users/:id')
    @AuditLog('update user')
    @ApiOperation({ summary: 'Update an existing user' })
    async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        await this.adminService.updateUser(id, updateUserDto);
    }

    @Delete('users/:id')
    @AuditLog('delete user')
    @ApiOperation({ summary: 'Delete a user' })
    async deleteUser(@Param('id') id: string) {
        await this.adminService.deleteUser(id);
    }

    // --- Module 5: Companies Management ---

    @Get('companies')
    @ApiOperation({ summary: 'List all companies (Paginated)' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'search', required: false, type: String })
    async listCompanies(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
        @Query('search') search?: string,
    ) {
        return this.adminService.listCompanies(Number(page), Number(limit), search);
    }

    @Post('companies')
    @ApiOperation({ summary: 'Create a new company' })
    async createCompany(@Body() createCompanyDto: CreateCompanyDto) {
        return this.adminService.createCompany(createCompanyDto);
    }

    @Put('companies/:id')
    @ApiOperation({ summary: 'Update an existing company' })
    async updateCompany(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
        return this.adminService.updateCompany(id, updateCompanyDto);
    }

    @Delete('companies/:id')
    @ApiOperation({ summary: 'Delete a company' })
    async deleteCompany(@Param('id') id: string) {
        return this.adminService.deleteCompany(id);
    }

    // --- Module 2 & 3: Configs Management ---

    @Get('configs/:category')
    @ApiOperation({ summary: 'Get configurations for a category (e.g. AI, EMAIL)' })
    async getConfigs(@Param('category') category: string) {
        return this.adminService.getConfigs(category);
    }

    @Put('configs/:category')
    @ApiOperation({ summary: 'Update configurations for a category' })
    async updateConfigs(@Param('category') category: string, @Body() updateConfigDto: UpdateConfigDto) {
        return this.adminService.updateConfigs(category, updateConfigDto);
    }

    @Get('email-config')
    @ApiOperation({ summary: 'Get email SMTP configuration from Redis' })
    async getEmailConfig() {
        return this.adminService.getEmailConfig();
    }

    @Put('email-config')
    @AuditLog('update email config')
    @ApiOperation({ summary: 'Update email SMTP configuration in Redis' })
    async updateEmailConfig(@Body() emailConfigDto: EmailConfigDto) {
        return this.adminService.updateEmailConfig(emailConfigDto);
    }

    @Post('email-config/test')
    @AuditLog('send test email')
    @ApiOperation({ summary: 'Send a test email using current SMTP configuration' })
    async sendTestEmail(@Body() sendTestEmailDto: SendTestEmailDto) {
        await this.adminService.sendTestEmail(sendTestEmailDto.email);
        return { message: 'Test email sent successfully' };
    }

    // --- Module 4: Audit Logs ---

    @Get('audit-logs')
    @ApiOperation({ summary: 'Get global system activity audit logs (Paginated)' })
    @ApiResponse({ status: 200, type: PaginatedAuditLogResponseDto })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'search', required: false, type: String })
    async getAuditLogs(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '20',
        @Query('search') search?: string,
    ) {
        return this.adminService.getAuditLogs(Number(page), Number(limit), search);
    }

    @Get('audit-logs/export')
    @ApiOperation({ summary: 'Export audit logs to CSV' })
    @ApiQuery({ name: 'search', required: false, type: String })
    async exportAuditLogs(
        @Res() res: Response,
        @Query('search') search?: string,
    ) {
        const csv = await this.adminService.exportAuditLogs(search);
        res.header('Content-Type', 'text/csv');
        res.attachment(`audit-logs-${new Date().toISOString()}.csv`);
        res.send(csv);
    }

    // --- Module 6: AI Provider Configuration ---

    @Get('ai-providers')
    @ApiOperation({ summary: 'Get all AI provider configurations' })
    @ApiResponse({ status: 200, type: AIProvidersListResponseDto })
    async getAllAIProviderConfigs(): Promise<AIProvidersListResponseDto> {
        return await this.adminService.getAllAIProviderConfigs();
    }

    @Get('ai-providers/:provider')
    @ApiOperation({ summary: 'Get specific AI provider configuration' })
    @ApiResponse({ status: 200, type: AIProviderResponseDto })
    async getAIProviderConfig(
        @Param('provider') provider: AIProvider,
    ): Promise<AIProviderResponseDto | null> {
        return await this.adminService.getAIProviderConfig(provider);
    }

    @Post('ai-providers')
    @AuditLog('save AI provider config')
    @ApiOperation({ summary: 'Save or update AI provider configuration' })
    @ApiResponse({ status: 201, type: AIProviderResponseDto })
    async saveAIProviderConfig(
        @Body() config: AIProviderConfigDto,
    ): Promise<AIProviderResponseDto> {
        return await this.adminService.saveAIProviderConfig(config);
    }

    @Put('ai-providers/:provider')
    @AuditLog('update AI provider config')
    @ApiOperation({ summary: 'Update AI provider configuration' })
    @ApiResponse({ status: 200, type: AIProviderResponseDto })
    async updateAIProviderConfig(
        @Param('provider') provider: AIProvider,
        @Body() config: AIProviderConfigDto,
    ): Promise<AIProviderResponseDto> {
        return await this.adminService.saveAIProviderConfig({
            ...config,
            provider,
        });
    }

    @Delete('ai-providers/:provider')
    @AuditLog('delete AI provider config')
    @ApiOperation({ summary: 'Delete AI provider configuration' })
    async deleteAIProviderConfig(
        @Param('provider') provider: AIProvider,
    ): Promise<{ message: string }> {
        await this.adminService.deleteAIProviderConfig(provider);
        return { message: `AI provider configuration for ${provider} deleted successfully` };
    }

    // ── Job Orders (Admin — full access, no scope) ────────────────────────

    @Get('job-orders')
    @ApiOperation({ summary: 'List all job orders' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'status', required: false })
    @ApiQuery({ name: 'search', required: false })
    adminListJobOrders(
        @Query('page') page = '1',
        @Query('limit') limit = '20',
        @Query('status') status?: string,
        @Query('search') search?: string,
    ) {
        return this.jobOrdersService.findAll({}, { page: +page, limit: +limit, status, search });
    }

    @Post('job-orders')
    @ApiOperation({ summary: 'Create a job order (assigned to any recruiter)' })
    adminCreateJobOrder(@GetUser() user: User, @Body() dto: CreateJobOrderDto) {
        return this.jobOrdersService.create(dto, user.id);
    }

    @Get('job-orders/:id')
    @ApiOperation({ summary: 'Get any job order by ID' })
    adminGetJobOrder(@Param('id') id: string) {
        return this.jobOrdersService.findOne(id);
    }

    @Put('job-orders/:id')
    @ApiOperation({ summary: 'Update any job order' })
    adminUpdateJobOrder(@Param('id') id: string, @Body() dto: UpdateJobOrderDto) {
        return this.jobOrdersService.update(id, dto);
    }

    @Patch('job-orders/:id/status')
    @ApiOperation({ summary: 'Update any job order status' })
    adminUpdateJobOrderStatus(@Param('id') id: string, @Body() dto: UpdateJobOrderStatusDto) {
        return this.jobOrdersService.updateStatus(id, dto.status);
    }

    @Delete('job-orders/:id')
    @AuditLog('delete job order')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a job order' })
    adminDeleteJobOrder(@Param('id') id: string) {
        return this.jobOrdersService.delete(id);
    }

    // ── Applications (Admin — full access, no scope) ───────────────────────

    @Get('applications')
    @ApiOperation({ summary: 'List all applications' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'status', required: false })
    @ApiQuery({ name: 'jobOrderId', required: false })
    adminListApplications(
        @Query('page') page = '1',
        @Query('limit') limit = '20',
        @Query('status') status?: string,
        @Query('jobOrderId') jobOrderId?: string,
    ) {
        return this.applicationsService.findAll({}, { page: +page, limit: +limit, status, jobOrderId });
    }

    @Get('applications/:id')
    @ApiOperation({ summary: 'Get any application by ID' })
    adminGetApplication(@Param('id') id: string) {
        return this.applicationsService.findOne(id);
    }

    @Post('applications')
    @ApiOperation({ summary: 'Create an application manually' })
    adminCreateApplication(@Body() dto: CreateApplicationDto) {
        return this.applicationsService.create(dto, 'recruiter_import');
    }

    @Patch('applications/:id/status')
    @ApiOperation({ summary: 'Update any application status' })
    adminUpdateApplicationStatus(@Param('id') id: string, @Body() dto: UpdateApplicationStatusDto) {
        return this.applicationsService.updateStatus(id, dto);
    }

    @Delete('applications/:id')
    @AuditLog('delete application')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete an application' })
    adminDeleteApplication(@Param('id') id: string) {
        return this.applicationsService.delete(id);
    }
}
