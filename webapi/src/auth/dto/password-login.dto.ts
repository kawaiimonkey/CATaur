import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PasswordLoginDto {
    @ApiProperty({ example: 'user@example.com', description: 'User email address' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'password123', description: 'User password' })
    @IsString()
    @MinLength(8)
    password: string;

    @ApiPropertyOptional({ description: 'Captcha token if a challenge is required' })
    @IsOptional()
    @IsString()
    captchaToken?: string;
}
