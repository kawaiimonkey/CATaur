import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class TotpLoginDto {
    @ApiProperty({ description: 'Short-lived MFA token returned by primary login' })
    @IsString()
    mfaToken: string;

    @ApiProperty({ description: '6-digit TOTP code from authenticator app', example: '123456' })
    @IsString()
    @Length(6, 6)
    code: string;
}
