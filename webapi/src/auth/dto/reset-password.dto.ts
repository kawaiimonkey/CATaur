import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
    @ApiProperty({
        example: 'd1c5c3e8-5f5e-4f5e-9b5e-4f5e1b5e5f5e',
        description: 'Password reset token from email',
    })
    @IsString()
    token: string;

    @ApiProperty({ example: 'newPassword456', description: 'New password' })
    @IsString()
    @MinLength(8)
    newPassword: string;
}
