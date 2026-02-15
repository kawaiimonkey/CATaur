import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsStrongPassword } from '../../common/decorators/is-strong-password.decorator';

export class ChangePasswordDto {
    @ApiProperty({ example: 'OldSecure123!', description: 'Current password' })
    @IsString()
    oldPassword: string;

    @ApiProperty({ example: 'NewSecure456!', description: 'New password' })
    @IsString()
    @IsStrongPassword()
    newPassword: string;
}
