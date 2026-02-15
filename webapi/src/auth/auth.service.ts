import { Injectable, ConflictException, Inject, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../database/entities/user.entity';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Passkey } from '../database/entities/passkey.entity';
import {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
    VerifiedRegistrationResponse,
    VerifiedAuthenticationResponse,
} from '@simplewebauthn/server';
import { ConfigService } from '@nestjs/config';

import { LoginResponseDto } from './dto/login-response.dto';
import { RegisterDto } from './dto/register.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { EmailService } from '../common/email.service';
import { UlidService } from '../common/ulid.service';

export type UserWithoutPassword = User;

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private emailService: EmailService,
        private ulidService: UlidService,
        private configService: ConfigService,
        @InjectRepository(Passkey)
        private passkeyRepository: Repository<Passkey>,
    ) { }

    async register(registerDto: RegisterDto): Promise<UserWithoutPassword> {
        let user = await this.usersService.findOneByEmail(registerDto.email);

        if (user) {
            if (user.isActive) {
                // If user is active, we don't want to allow re-registration,
                // but we should probably tell them to login.
                throw new ConflictException('Email already registered');
            }
            // If inactive, we just resend the verification email (logic below)
        } else {
            // Create inactive user
            user = await this.usersService.create(registerDto);
        }

        // Generate and store verification token
        const token = this.ulidService.generate();
        await this.cacheManager.set(`verify_email:${token}`, user.email, 3600 * 1000); // 1 hour

        // Send email
        await this.emailService.sendVerificationEmail(user.email, token);

        return user;
    }

    async requestMagicLink(email: string): Promise<void> {
        const user = await this.usersService.findOneByEmail(email);

        if (!user || !user.isActive) {
            // For security, we might not want to reveal if user exists,
            // but for a test app / internal tools, a clearer error is often better.
            throw new NotFoundException('Active user not found');
        }

        // Generate and store verification token (reuse same prefix as registration for simplicity)
        const token = this.ulidService.generate();
        await this.cacheManager.set(`verify_email:${token}`, user.email, 3600 * 1000); // 1 hour

        // Send email (we can reuse the same template or add a new one if needed, 
        // but verifyEmail works for both)
        await this.emailService.sendVerificationEmail(user.email, token);
    }

    async verifyEmail(token: string): Promise<LoginResponseDto> {
        const email = await this.cacheManager.get<string>(`verify_email:${token}`);
        if (!email) {
            throw new BadRequestException('Invalid or expired verification token');
        }

        const user = await this.usersService.findOneByEmail(email);
        if (!user) {
            throw new BadRequestException('User not found');
        }

        await this.usersService.update(user.id, { isActive: true });
        await this.cacheManager.del(`verify_email:${token}`);

        // Return login token immediately so user can bind passkey
        return this.login(user);
    }

    async login(user: UserWithoutPassword): Promise<LoginResponseDto> {
        const payload = { email: user.email, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async generateRegistrationOptions(email: string) {
        const user = await this.usersService.findOneByEmail(email);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const userPasskeys = await this.passkeyRepository.find({ where: { userId: user.id } });

        const rpName = this.configService.get<string>('WEBAUTHN_RP_NAME') || 'CATaur';
        const rpID = this.configService.get<string>('WEBAUTHN_RP_ID') || 'localhost';

        const excludeCredentials = userPasskeys.map(passkey => ({
            id: passkey.credentialID,
            type: 'public-key' as const,
        }));

        const options = await generateRegistrationOptions({
            rpName,
            rpID,
            userID: Buffer.from(user.id),
            userName: user.email,
            attestationType: 'none',
            excludeCredentials,
            authenticatorSelection: {
                residentKey: 'preferred',
                userVerification: 'preferred',
                authenticatorAttachment: 'platform',
            },
        });

        await this.cacheManager.set(`registration_challenge:${user.id}`, options.challenge, 60000);

        return options;
    }

    async verifyRegistration(email: string, body: any) {
        const user = await this.usersService.findOneByEmail(email);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const expectedChallenge = await this.cacheManager.get<string>(`registration_challenge:${user.id}`);
        if (!expectedChallenge) {
            throw new BadRequestException('Registration challenge expired or not found');
        }

        const expectedOrigin = this.configService.get<string>('WEBAUTHN_ORIGIN') || 'http://localhost:3000';
        const expectedRPID = this.configService.get<string>('WEBAUTHN_RP_ID') || 'localhost';

        let verification: VerifiedRegistrationResponse;
        try {
            verification = await verifyRegistrationResponse({
                response: body,
                expectedChallenge,
                expectedOrigin,
                expectedRPID,
            });
        } catch (error) {
            throw new BadRequestException(error.message);
        }

        const { verified, registrationInfo } = verification;

        if (verified && registrationInfo) {
            const { credential } = registrationInfo;
            const credentialID = credential.id;

            const existingPasskey = await this.passkeyRepository.findOne({ where: { credentialID } });
            if (existingPasskey) {
                throw new ConflictException('Passkey already registered');
            }

            const newPasskey = this.passkeyRepository.create({
                credentialID: credentialID,
                publicKey: Buffer.from(credential.publicKey),
                counter: credential.counter,
                transports: body.response.transports,
                userId: user.id,
            });

            await this.passkeyRepository.save(newPasskey);
            await this.cacheManager.del(`registration_challenge:${user.id}`);

            return { verified: true };
        }

        return { verified: false };
    }

    async generateAuthenticationOptions(email: string) {
        const user = await this.usersService.findOneByEmail(email);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const userPasskeys = await this.passkeyRepository.find({ where: { userId: user.id } });
        const rpID = this.configService.get<string>('WEBAUTHN_RP_ID') || 'localhost';

        const options = await generateAuthenticationOptions({
            rpID,
            allowCredentials: userPasskeys.map(passkey => ({
                id: passkey.credentialID,
                type: 'public-key' as const,
            })),
            userVerification: 'preferred',
        });

        await this.cacheManager.set(`authentication_challenge:${user.id}`, options.challenge, 60000);

        return options;
    }

    async verifyAuthentication(email: string, body: any) {
        const user = await this.usersService.findOneByEmail(email);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const expectedChallenge = await this.cacheManager.get<string>(`authentication_challenge:${user.id}`);
        if (!expectedChallenge) {
            throw new BadRequestException('Authentication challenge expired or not found');
        }

        const passkey = await this.passkeyRepository.findOne({ where: { credentialID: body.id } });
        if (!passkey) {
            throw new NotFoundException('Passkey not found');
        }

        const expectedOrigin = this.configService.get<string>('WEBAUTHN_ORIGIN') || 'http://localhost:3000';
        const expectedRPID = this.configService.get<string>('WEBAUTHN_RP_ID') || 'localhost';

        let verification: VerifiedAuthenticationResponse;
        try {
            verification = await verifyAuthenticationResponse({
                response: body,
                expectedChallenge,
                expectedOrigin,
                expectedRPID,
                credential: {
                    id: passkey.credentialID,
                    publicKey: new Uint8Array(passkey.publicKey),
                    counter: passkey.counter,
                },
            });
        } catch (error) {
            throw new BadRequestException(error.message);
        }

        const { verified, authenticationInfo } = verification;

        if (verified) {
            passkey.counter = authenticationInfo.newCounter;
            await this.passkeyRepository.save(passkey);
            await this.cacheManager.del(`authentication_challenge:${user.id}`);

            return this.login(user);
        }

        return { verified: false };
    }
}
