import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateApplicationDto {
    @ApiProperty()
    @IsString()
    jobOrderId: string;

    @ApiProperty()
    @IsString()
    candidateId: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    location?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    availability?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    recruiterNotes?: string;
}

export class UpdateApplicationStatusDto {
    @ApiProperty({ enum: ['new', 'interview', 'offer', 'closed'] })
    @IsIn(['new', 'interview', 'offer', 'closed'])
    status: string;

    // Interview details — required when status = interview
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    interviewSubject?: string;

    @ApiProperty({ required: false, enum: ['Zoom', 'Phone', 'Onsite'] })
    @IsOptional()
    @IsIn(['Zoom', 'Phone', 'Onsite'])
    interviewType?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    interviewDate?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    interviewTime?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    interviewContent?: string;
}

export class SubmitDecisionDto {
    @ApiProperty({ enum: ['request-offer', 'pass', 'hold'] })
    @IsIn(['request-offer', 'pass', 'hold'])
    type: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    note?: string;
}

export class BulkImportDto {
    @ApiProperty()
    @IsString()
    jobOrderId: string;

    @ApiProperty({ type: [Object] })
    candidates: Array<{
        name: string;
        email: string;
        phone?: string;
        location?: string;
        availability?: string;
    }>;
}
