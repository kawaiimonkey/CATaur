import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/database/entities/user.entity';
import { Repository } from 'typeorm';

import { EmailService } from '../src/common/email.service';
import { CaptchaService } from '../src/auth/captcha.service';

describe('Users Profile Endpoints (e2e)', () => {
    let app: INestApplication;
    let userRepository: Repository<User>;
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
        app.useGlobalPipes(new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }));
        await app.init();

        userRepository = app.get(getRepositoryToken(User));
    });

    afterAll(async () => {
        await app.close();
    });

    describe('Profile Lifecycle Verification', () => {
        const email = `profile_test_${Date.now()}@example.com`;
        const password = 'SecurePass123!';
        let accessToken: string;
        let userId: string;

        it('1. Register and activate user to get token', async () => {
            const registerRes = await request(app.getHttpServer())
                .post('/auth/register')
                .send({ email, password });

            expect([200, 201]).toContain(registerRes.status);
            userId = registerRes.body.id;

            await userRepository.update(userId, { isActive: true });

            const loginRes = await request(app.getHttpServer())
                .post('/auth/login/password')
                .send({ email, password });

            expect([200, 201]).toContain(loginRes.status);
            accessToken = loginRes.body.access_token;
            expect(accessToken).toBeDefined();
        });

        it('2. GET /users/me should return initial empty profile', async () => {
            const response = await request(app.getHttpServer())
                .get('/users/me')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(response.status).toBe(200);
            expect(response.body.email).toBe(email);
            expect(response.body.nickname).toBeNull();
            expect(response.body.avatarUrl).toBeNull();
            expect(response.body.bio).toBeNull();
        });

        it('3. PUT /users/me should update the profile successfully', async () => {
            const response = await request(app.getHttpServer())
                .put('/users/me')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    nickname: 'TestUser',
                    avatarUrl: 'https://example.com/avatar.png',
                    bio: 'This is an e2e test bio',
                });

            expect(response.status).toBe(200);
            expect(response.body.nickname).toBe('TestUser');
            expect(response.body.avatarUrl).toBe('https://example.com/avatar.png');
            expect(response.body.bio).toBe('This is an e2e test bio');
        });

        it('4. GET /users/me should reflect the updated profile', async () => {
            const response = await request(app.getHttpServer())
                .get('/users/me')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(response.status).toBe(200);
            expect(response.body.nickname).toBe('TestUser');
            expect(response.body.avatarUrl).toBe('https://example.com/avatar.png');
            expect(response.body.bio).toBe('This is an e2e test bio');
        });

        it('5. PUT /users/me should validate inputs', async () => {
            const response = await request(app.getHttpServer())
                .put('/users/me')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    nickname: 'A'.repeat(51), // Exceeds maxLength 50
                    avatarUrl: 'not-a-valid-url', // Fails @IsUrl
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toEqual(expect.arrayContaining([
                expect.stringContaining('nickname must be shorter than or equal to 50 characters'),
                expect.stringContaining('avatarUrl must be a URL address')
            ]));
        });
    });
});
