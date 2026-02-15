import { IsEmail, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VerifyCodeLoginDto {
    @ApiProperty({ example: 'user@example.com', description: 'User email address' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: '123456', description: '6-digit verification code' })
    @IsString()
    @Length(6, 6)
    code: string;

    @ApiPropertyOptional({ description: 'Captcha token if a challenge is required' })
    @IsOptional()
    @IsString()
    captchaToken?: string;
}
