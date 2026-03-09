import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/database/entities/user.entity';
import { UserRole, Role } from '../src/database/entities/user-role.entity';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { UsersService } from '../src/users/users.service';

import { EmailService } from '../src/common/email.service';
import { CaptchaService } from '../src/auth/captcha.service';

describe('RBAC (e2e)', () => {
    let app: INestApplication;
    let userRoleRepository: Repository<UserRole>;
    let userRepository: Repository<User>;
    let usersService: UsersService;
    jest.setTimeout(30000);

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
        .overrideProvider(EmailService)
        .useValue({
            sendVerificationEmail: jest.fn().mockResolvedValue(true),
            sendVerificationCodeEmail: jest.fn().mockResolvedValue(true),
            sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
            sendPasswordChangedNotification: jest.fn().mockResolvedValue(true),
        })
        .overrideProvider(CaptchaService)
        .useValue({
            verifyToken: jest.fn().mockResolvedValue(true),
        })
        .compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();

        userRoleRepository = app.get(getRepositoryToken(UserRole));
        userRepository = app.get(getRepositoryToken(User));
        usersService = app.get(UsersService);
    });

    afterAll(async () => {
        await app.close();
    });

    describe('RBAC Verification', () => {
        const email = `rbac_test_${Date.now()}@example.com`;
        const password = 'SecurePass123!';
        let accessToken: string;
        let userId: string;

        it('1. Register a new user (default role USER)', async () => {
            const response = await request(app.getHttpServer())
                .post('/auth/register')
                .send({ email, password, nickname: 'rbac-user' });

            expect([200, 201]).toContain(response.status);
            userId = response.body.id;
        });

        it('2. Login and get token', async () => {
            // First activate the user
            await userRepository.update(userId, { isActive: true });

            const response = await request(app.getHttpServer())
                .post('/auth/login/password')
                .send({ email, password });

            expect([200, 201]).toContain(response.status);
            accessToken = response.body.access_token;
        });

        it('3. Access /users protected by ADMIN role -> Should be 403', async () => {
            const response = await request(app.getHttpServer())
                .get('/users')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(response.status).toBe(403);
        });

        it('4. Grant ADMIN role to user', async () => {
            // Use UsersService to assign role, which should handle cache invalidation
            await usersService.assignRoles(userId, [Role.ADMIN]);
        });

        it('5. Access /users with ADMIN role -> Should be 200', async () => {
            const response = await request(app.getHttpServer())
                .get('/users')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            const roles = response.body
                .flatMap((u: any) => (u.roles || []).map((r: any) => r.role));
            expect(roles).toContain(Role.ADMIN);
        });
    });
});
