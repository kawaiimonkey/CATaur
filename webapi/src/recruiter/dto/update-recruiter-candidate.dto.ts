import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateRecruiterCandidateDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    location?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    availability?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    recruiterNotes?: string;

    @ApiPropertyOptional({ enum: ['new', 'interview', 'offer', 'closed'] })
    @IsOptional()
    @IsIn(['new', 'interview', 'offer', 'closed'])
    status?: 'new' | 'interview' | 'offer' | 'closed';

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    nickname?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    phone?: string;
}
