import { IsEmail, IsEnum, IsOptional, IsString, IsBoolean, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../database/entities/user-role.entity';

export class UpdateUserDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    accountName?: string;

    @ApiProperty({ enum: Role, required: false })
    @IsOptional()
    @IsEnum(Role)
    role?: Role;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    @MinLength(6)
    password?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
