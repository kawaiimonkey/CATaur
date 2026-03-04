import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Res } from '@nestjs/common';
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

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles(Role.ADMIN)
@ApiBearerAuth()
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

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
}
