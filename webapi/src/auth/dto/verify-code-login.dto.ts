import { IsEmail, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyCodeLoginDto {
    @ApiProperty({ example: 'user@example.com', description: 'User email address' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: '123456', description: '6-digit verification code' })
    @IsString()
    @Length(6, 6)
    code: string;
}
