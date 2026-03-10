import { ApiPropertyOptional } from '@nestjs/swagger';

export class LoginResponseDto {
    @ApiPropertyOptional({ description: 'The JWT access token' })
    access_token?: string;

    @ApiPropertyOptional({ description: 'User ID' })
    userId?: string;

    @ApiPropertyOptional({ description: 'User email address' })
    email?: string;

    @ApiPropertyOptional({ description: 'User roles', type: [String] })
    roles?: string[];

    @ApiPropertyOptional({ description: 'Whether MFA is required to complete login' })
    mfa_required?: boolean;

    @ApiPropertyOptional({ description: 'Short-lived MFA token for TOTP verification' })
    mfa_token?: string;

    @ApiPropertyOptional({ description: 'MFA method type', enum: ['totp'] })
    mfa_type?: 'totp';
}
