import { IsString, IsOptional, IsArray, IsInt, IsIn, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateJobOrderDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    companyId?: string;

    @ApiProperty({ enum: ['high', 'medium', 'low'], required: false })
    @IsOptional()
    @IsIn(['high', 'medium', 'low'])
    priority?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    location?: string;

    @ApiProperty({ required: false })
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

export class UpdateJobOrderStatusDto {
    @ApiProperty({ enum: ['sourcing', 'interview', 'offer', 'filled', 'paused'] })
    @IsIn(['sourcing', 'interview', 'offer', 'filled', 'paused'])
    status: string;
}
