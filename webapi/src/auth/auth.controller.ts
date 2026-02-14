import { Controller, Post, UseGuards, Body, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { UserWithoutPassword } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { LoginResponseDto } from './dto/login-response.dto';
import { RegisterDto } from './dto/register.dto';
import { GetUser } from './decorators/user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({ status: 201, description: 'User successfully registered. Please check your email for verification link.' })
    @ApiResponse({ status: 409, description: 'Email already exists' })
    async register(@Body() registerDto: RegisterDto): Promise<UserWithoutPassword> {
        return this.authService.register(registerDto);
    }

    @Get('verify')
    @ApiOperation({ summary: 'Verify user email' })
    @ApiQuery({ name: 'token', description: 'The verification token' })
    @ApiResponse({ status: 200, description: 'Email verified successfully' })
    @ApiResponse({ status: 400, description: 'Invalid or expired token' })
    async verify(@Query('token') token: string): Promise<{ message: string }> {
        await this.authService.verifyEmail(token);
        return { message: 'Email verified successfully' };
    }

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

    @Post('generate-registration-options')
    @ApiOperation({ summary: 'Generate WebAuthn registration options' })
    async generateRegistrationOptions(@Body() body: { email: string, attachment?: 'platform' | 'cross-platform' }) {
        return this.authService.generateRegistrationOptions(body.email, body.attachment);
    }

    @Post('verify-registration')
    @ApiOperation({ summary: 'Verify WebAuthn registration response' })
    async verifyRegistration(@Body('email') email: string, @Body('response') response: any) {
        return this.authService.verifyRegistration(email, response);
    }

    @Post('generate-authentication-options')
    @ApiOperation({ summary: 'Generate WebAuthn authentication options' })
    async generateAuthenticationOptions(@Body('email') email: string) {
        return this.authService.generateAuthenticationOptions(email);
    }

    @Post('verify-authentication')
    @ApiOperation({ summary: 'Verify WebAuthn authentication response' })
    async verifyAuthentication(@Body('email') email: string, @Body('response') response: any) {
        return this.authService.verifyAuthentication(email, response);
    }
}
