import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ParseResumeDto {
    @ApiPropertyOptional({ description: 'Uploaded resume file URL or relative file-service path such as /files/view/...' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    resumeUrl?: string;

    @ApiPropertyOptional({ description: 'Raw resume text. Preferred for MVP/local parsing.' })
    @IsOptional()
    @IsString()
    rawText?: string;
}
