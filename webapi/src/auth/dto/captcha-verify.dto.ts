import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CaptchaVerifyDto {
    @ApiProperty({ description: 'Captcha token from the client' })
    @IsString()
    @MinLength(1)
    token: string;
}
