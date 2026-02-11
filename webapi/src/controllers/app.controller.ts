import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from '../services/app.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { GetUser } from '../auth/decorators/user.decorator';
import type { UserWithoutPassword } from '../auth/auth.service';

@ApiTags('profile')
@Controller()
export class AppController {
    constructor(private readonly appService: AppService) { }

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get profile information (Protected)' })
    @ApiResponse({ status: 200, type: UserResponseDto })
    getProfile(@GetUser() user: UserWithoutPassword): UserWithoutPassword {
        return user;
    }
}
