import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsBoolean, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../database/entities/user-role.entity';

export class CreateUserDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    accountName: string;

    @ApiProperty({ enum: Role })
    @IsEnum(Role)
    role: Role;

    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty({ required: false, default: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
