import { Body, Controller, Get, NotFoundException, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiExtraModels, ApiOkResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequireRoles } from '../auth/decorators/roles.decorator';
import { Role } from '../database/entities/user-role.entity';
import { User } from '../database/entities/user.entity';
import { GetUser } from '../auth/decorators/user.decorator';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { createApiResponseDto } from '../common/dto/api-response.dto';

const UserResponseDto = createApiResponseDto(User);

@ApiTags('users')
@ApiExtraModels(UserResponseDto, User)
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Get('me')
    @ApiOperation({ summary: 'Get current user profile' })
    @ApiOkResponse({ type: UserResponseDto })
    async getProfile(@GetUser() user: User): Promise<Omit<User, 'passwordHash' | 'totpSecretEnc'>> {
        // user object is already populated by JwtAuthGuard and the decorator
        const fullUser = await this.usersService.findOneById(user.id);
        if (!fullUser) {
            throw new NotFoundException('User not found');
        }
        const { passwordHash, totpSecretEnc, ...safeUser } = fullUser;
        return safeUser;
    }

    @Put('me')
    @ApiOperation({ summary: 'Update current user profile' })
    @ApiOkResponse({ type: UserResponseDto })
    async updateProfile(
        @GetUser() user: User,
        @Body() updateProfileDto: UpdateUserProfileDto
    ): Promise<User> {
        return this.usersService.update(user.id, updateProfileDto);
    }

    @Get()
    @RequireRoles(Role.ADMIN)
    @ApiOperation({ summary: 'Get all users (Admin only)' })
    @ApiOkResponse({ type: UserResponseDto, isArray: true })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async findAll(): Promise<User[]> {
        return this.usersService.findAll();
    }

    @Get('admins')
    @RequireRoles(Role.ADMIN)
    @ApiOperation({ summary: 'Get all admin users' })
    @ApiOkResponse({ type: UserResponseDto, isArray: true })
    async findAdmins(): Promise<User[]> {
        return this.usersService.findByRole(Role.ADMIN);
    }
}
