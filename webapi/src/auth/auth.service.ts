import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../database/entities/user.entity';
import * as bcrypt from 'bcrypt';

import { LoginResponseDto } from './dto/login-response.dto';
import { RegisterDto } from './dto/register.dto';
import { ConflictException, Inject, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { EmailService } from '../common/email.service';
import { UlidService } from '../common/ulid.service';

export type UserWithoutPassword = Omit<User, 'password'>;

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private emailService: EmailService,
        private ulidService: UlidService,
    ) { }

    async register(registerDto: RegisterDto): Promise<UserWithoutPassword> {
        const existingUser = await this.usersService.findOneByEmail(registerDto.email);

        let user;
        if (existingUser) {
            if (existingUser.isActive) {
                throw new ConflictException('Email already registered');
            }
            // Update the existing inactive user
            user = await this.usersService.update(existingUser.id, {
                password: registerDto.password
            });
        } else {
            // Create inactive user
            user = await this.usersService.create(registerDto);
        }

        // Generate and store verification token
        const token = this.ulidService.generate();
        await this.cacheManager.set(`verify_email:${token}`, user.email, 3600 * 1000); // 1 hour

        // Send email
        await this.emailService.sendVerificationEmail(user.email, token);

        const { password, ...result } = user;
        return result;
    }

    async verifyEmail(token: string): Promise<void> {
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
    }

    async validateUser(email: string, pass: string): Promise<UserWithoutPassword | null> {
        const user = await this.usersService.findOneByEmail(email);
        if (user && await bcrypt.compare(pass, user.password)) {
            if (!user.isActive) {
                throw new UnauthorizedException('Please verify your email first');
            }
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: UserWithoutPassword): Promise<LoginResponseDto> {
        const payload = { email: user.email, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
