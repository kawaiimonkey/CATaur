import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
    @ApiProperty({ example: 'oldPassword123', description: 'Current password' })
    @IsString()
    @MinLength(8)
    oldPassword: string;

    @ApiProperty({ example: 'newPassword456', description: 'New password' })
    @IsString()
    @MinLength(8)
    newPassword: string;
}
