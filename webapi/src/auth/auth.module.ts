import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthAttemptsService } from './auth-attempts.service';
import { CaptchaService } from './captcha.service';
import { FirebaseService } from './firebase.service';


import { TypeOrmModule } from '@nestjs/typeorm';
import { Passkey } from '../database/entities/passkey.entity';

@Module({
    imports: [
        UsersModule,
        PassportModule,
        TypeOrmModule.forFeature([Passkey]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.getOrThrow<string>('JWT_SECRET'),
                signOptions: { expiresIn: '30d' },
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [AuthService, JwtStrategy, AuthAttemptsService, CaptchaService, FirebaseService],
    controllers: [AuthController],
    exports: [AuthService, FirebaseService],
})
export class AuthModule { }
