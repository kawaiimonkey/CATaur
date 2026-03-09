import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

export class ApplyResumeDto {
    @ApiProperty()
    @IsString()
    parserId: string;

    @ApiProperty({ enum: ['overwrite', 'merge'], default: 'overwrite' })
    @IsIn(['overwrite', 'merge'])
    applyMode: 'overwrite' | 'merge';
}
