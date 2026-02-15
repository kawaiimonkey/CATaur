import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
    @ApiProperty({ description: 'The email of the user', example: 'user@example.com' })
    @IsEmail()
    email: string;


}
