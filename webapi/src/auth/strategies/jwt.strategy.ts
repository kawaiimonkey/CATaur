import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserWithoutPassword } from '../auth.service';
import { UsersService } from '../../users/users.service';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        private usersService: UsersService,
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') || 'secretKey',
        });
    }

    async validate(payload: any): Promise<UserWithoutPassword> {
        const cacheKey = `auth_user_${payload.email}`;
        const cachedUser = await this.cacheManager.get<UserWithoutPassword>(cacheKey);

        if (cachedUser) {
            return cachedUser;
        }

        const user = await this.usersService.findOneByEmail(payload.email);
        if (!user) {
            throw new UnauthorizedException();
        }

        await this.cacheManager.set(cacheKey, user, 600 * 1000); // 10 minutes cache

        return user;
    }
}
