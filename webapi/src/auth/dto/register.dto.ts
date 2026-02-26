import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';
import { IsStrongPassword } from '../../common/decorators/is-strong-password.decorator';

export class RegisterDto {
    @ApiProperty({ description: 'The email of the user', example: 'user@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'The password for the account', example: 'SecurePass123!' })
    @IsString()
    @IsStrongPassword()
    password: string;
}
