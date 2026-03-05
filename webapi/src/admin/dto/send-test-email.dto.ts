import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendTestEmailDto {
    @ApiProperty({ example: 'admin@example.com' })
    @IsNotEmpty()
    @IsEmail()
    email: string;
}