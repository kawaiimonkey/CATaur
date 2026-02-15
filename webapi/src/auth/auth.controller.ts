import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AuthService, UserWithoutPassword } from './auth.service';
import { LoginResponseDto } from './dto/login-response.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

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

    @Post('request-magic-link')
    @ApiOperation({ summary: 'Request a magic link for login (recovery)' })
    @ApiResponse({ status: 200, description: 'Magic link sent if user exists' })
    async requestMagicLink(@Body('email') email: string) {
        await this.authService.requestMagicLink(email);
        return { message: 'Magic link sent' };
    }

    @Get('verify')
    @ApiOperation({ summary: 'Verify user email and login' })
    @ApiQuery({ name: 'token', description: 'The verification token' })
    @ApiResponse({ status: 200, type: LoginResponseDto, description: 'Email verified and logged in successfully' })
    @ApiResponse({ status: 400, description: 'Invalid or expired token' })
    async verify(@Query('token') token: string): Promise<LoginResponseDto> {
        return this.authService.verifyEmail(token);
    }

    @UseGuards(JwtAuthGuard)
    @Post('generate-registration-options')
    @ApiOperation({ summary: 'Generate WebAuthn registration options for this device' })
    async generateRegistrationOptions(@Body('email') email: string) {
        return this.authService.generateRegistrationOptions(email);
    }

    @UseGuards(JwtAuthGuard)
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
