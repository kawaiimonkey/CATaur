import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEmail, IsInt, IsNotEmpty, IsString, Max, Min, ValidateNested } from 'class-validator';

export class EmailAuthDto {
    @ApiProperty({ example: 'smtp-user@example.com' })
    @IsNotEmpty()
    @IsString()
    user: string;

    @ApiProperty({ example: 'app-password-or-smtp-password' })
    @IsNotEmpty()
    @IsString()
    pass: string;
}

export class EmailConfigDto {
    @ApiProperty({ example: 'smtp.gmail.com' })
    @IsNotEmpty()
    @IsString()
    host: string;

    @ApiProperty({ example: 587 })
    @IsInt()
    @Min(1)
    @Max(65535)
    port: number;

    @ApiProperty({ example: false })
    @IsBoolean()
    secure: boolean;

    @ApiProperty({ type: EmailAuthDto })
    @ValidateNested()
    @Type(() => EmailAuthDto)
    auth: EmailAuthDto;

    @ApiProperty({ example: 'no-reply@cataur.com' })
    @IsNotEmpty()
    @IsEmail()
    emailFrom: string;

    @ApiProperty({ example: 'CATaur System' })
    @IsNotEmpty()
    @IsString()
    fromName: string;
}
