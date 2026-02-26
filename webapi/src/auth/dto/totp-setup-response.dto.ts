import { ApiProperty } from '@nestjs/swagger';

export class TotpSetupResponseDto {
    @ApiProperty({ description: 'Base32 TOTP secret to register in the authenticator app' })
    secret: string;

    @ApiProperty({ description: 'otpauth URL for QR code generation' })
    otpauthUrl: string;
}
