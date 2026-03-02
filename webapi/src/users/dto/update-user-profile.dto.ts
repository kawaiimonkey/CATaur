import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, IsUrl } from 'class-validator';

export class UpdateUserProfileDto {
    @ApiPropertyOptional({ description: 'The nickname of the user', maxLength: 50 })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    nickname?: string;

    @ApiPropertyOptional({ description: 'The avatar URL of the user', maxLength: 255 })
    @IsOptional()
    @IsUrl()
    @MaxLength(255)
    avatarUrl?: string;

    @ApiPropertyOptional({ description: 'A short bio of the user', maxLength: 500 })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    bio?: string;
}
