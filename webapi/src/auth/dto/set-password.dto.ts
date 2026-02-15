import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetPasswordDto {
    @ApiProperty({ example: 'password123', description: 'Password to set' })
    @IsString()
    @MinLength(8)
    password: string;
}
