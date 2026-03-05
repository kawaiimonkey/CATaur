import { IsString, IsOptional, IsArray, IsInt, IsIn, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateJobOrderDto {
    @ApiProperty()
    @IsString()
    title: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    companyId?: string;

    @ApiProperty({ enum: ['high', 'medium', 'low'], default: 'medium' })
    @IsOptional()
    @IsIn(['high', 'medium', 'low'])
    priority?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    location?: string;

    @ApiProperty({ default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    openings?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    salary?: string;

    @ApiProperty({ required: false, type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];
}
