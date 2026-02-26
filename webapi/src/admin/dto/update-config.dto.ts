import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfigItemDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    key: string;

    @ApiProperty()
    @IsString()
    value: string;
}

export class UpdateConfigDto {
    @ApiProperty({ type: [ConfigItemDto] })
    @IsNotEmpty()
    configs: ConfigItemDto[];
}
