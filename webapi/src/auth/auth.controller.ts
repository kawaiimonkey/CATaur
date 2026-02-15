import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AuthService, UserWithoutPassword } from './auth.service';
import { LoginResponseDto } from './dto/login-response.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PasswordLoginDto } from './dto/password-login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RequestVerificationCodeDto } from './dto/request-verification-code.dto';
import { VerifyCodeLoginDto } from './dto/verify-code-login.dto';
import { SetPasswordDto } from './dto/set-password.dto';
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

    @Post('login/password')
    @ApiOperation({ summary: 'Login with email and password' })
    @ApiResponse({ status: 200, type: LoginResponseDto, description: 'Login successful' })
    @ApiResponse({ status: 401, description: 'Invalid email or password' })
    async loginWithPassword(@Body() passwordLoginDto: PasswordLoginDto): Promise<LoginResponseDto> {
        return this.authService.loginWithPassword(passwordLoginDto.email, passwordLoginDto.password);
    }

    @Post('request-password-reset')
    @ApiOperation({ summary: 'Request a password reset email' })
    @ApiResponse({ status: 200, description: 'Password reset email sent if user exists' })
    async requestPasswordReset(@Body() requestPasswordResetDto: RequestPasswordResetDto) {
        await this.authService.requestPasswordReset(requestPasswordResetDto.email);
        return { message: 'Password reset link sent if user exists' };
    }

    @Post('reset-password')
    @ApiOperation({ summary: 'Reset password with token' })
    @ApiResponse({ status: 200, description: 'Password reset successful' })
    @ApiResponse({ status: 400, description: 'Invalid or expired token' })
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        await this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.newPassword);
        return { message: 'Password reset successful' };
    }

    @UseGuards(JwtAuthGuard)
    @Post('change-password')
    @ApiOperation({ summary: 'Change password for authenticated user' })
    @ApiResponse({ status: 200, description: 'Password changed successfully' })
    @ApiResponse({ status: 401, description: 'Invalid current password' })
    async changePassword(@GetUser() user: UserWithoutPassword, @Body() changePasswordDto: ChangePasswordDto) {
        await this.authService.changePassword(user.id, changePasswordDto.oldPassword, changePasswordDto.newPassword);
        return { message: 'Password changed successfully' };
    }

    @UseGuards(JwtAuthGuard)
    @Post('set-password')
    @ApiOperation({ summary: 'Set password for newly verified user (after email verification)' })
    @ApiResponse({ status: 200, description: 'Password set successfully' })
    async setPassword(@GetUser() user: UserWithoutPassword, @Body() setPasswordDto: SetPasswordDto) {
        await this.authService.setPassword(user.id, setPasswordDto.password);
        return { message: 'Password set successfully' };
    }

    @Post('request-verification-code')
    @ApiOperation({ summary: 'Request verification code for email login' })
    @ApiResponse({ status: 200, description: 'Verification code sent if user exists' })
    async requestVerificationCode(@Body() requestVerificationCodeDto: RequestVerificationCodeDto) {
        await this.authService.requestVerificationCode(requestVerificationCodeDto.email);
        return { message: 'Verification code sent if user exists' };
    }

    @Post('login/verification-code')
    @ApiOperation({ summary: 'Login with email and verification code' })
    @ApiResponse({ status: 200, type: LoginResponseDto, description: 'Login successful' })
    @ApiResponse({ status: 401, description: 'Invalid email or code' })
    async loginWithVerificationCode(@Body() verifyCodeLoginDto: VerifyCodeLoginDto): Promise<LoginResponseDto> {
        return this.authService.loginWithVerificationCode(verifyCodeLoginDto.email, verifyCodeLoginDto.code);
    }
}
