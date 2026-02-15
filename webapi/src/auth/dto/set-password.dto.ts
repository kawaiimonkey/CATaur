import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsStrongPassword } from '../../common/decorators/is-strong-password.decorator';

export class SetPasswordDto {
    @ApiProperty({ example: 'SecurePass123!', description: 'Password to set' })
    @IsString()
    @IsStrongPassword()
    password: string;
}
