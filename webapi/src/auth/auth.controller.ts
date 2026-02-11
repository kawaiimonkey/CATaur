import { Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { UserWithoutPassword } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { LoginResponseDto } from './dto/login-response.dto';
import { GetUser } from './decorators/user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    @ApiOperation({ summary: 'Login with email and password' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string' },
                password: { type: 'string' },
            },
        },
    })
    @ApiResponse({ status: 200, type: LoginResponseDto })
    async login(
        @GetUser() user: UserWithoutPassword,
    ): Promise<LoginResponseDto> {
        return this.authService.login(user);
    }
}
