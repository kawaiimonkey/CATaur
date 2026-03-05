import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { User } from '../src/database/entities/user.entity';
import { UserRole, Role } from '../src/database/entities/user-role.entity';
import * as bcrypt from 'bcrypt';
import { UlidService } from '../src/common/ulid.service';
import { EmailService } from '../src/common/email.service';
import { CaptchaService } from '../src/auth/captcha.service';

describe('AdminController listUsers (e2e)', () => {
    let app: INestApplication;
    let dataSource: DataSource;
    let ulidService: UlidService;
    let adminToken: string;

    beforeAll(async () => {
        const mockEmailService = {
            sendVerificationEmail: jest.fn().mockResolvedValue(true),
            sendVerificationCodeEmail: jest.fn().mockResolvedValue(true),
        };
        const mockCaptchaService = {
            verifyToken: jest.fn().mockResolvedValue(true),
        };

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(EmailService)
            .useValue(mockEmailService)
            .overrideProvider(CaptchaService)
            .useValue(mockCaptchaService)
            .compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
        await app.init();

        dataSource = app.get(getDataSourceToken());
        ulidService = app.get(UlidService);

        await cleanup();
        await seedData();
    });

    afterAll(async () => {
        await cleanup();
        await app.close();
    });

    async function cleanup() {
        await dataSource.createQueryBuilder().delete().from(UserRole).execute();
        await dataSource.createQueryBuilder().delete().from(User).execute();
    }

    async function seedData() {
        const passwordHash = await bcrypt.hash('password123', 12);

        // Create 15 users (1 admin, 7 clients, 7 recruiters)
        for (let i = 0; i < 15; i++) {
            const userId = ulidService.generate();
            const role = i === 0 ? Role.ADMIN : (i % 2 === 0 ? Role.CLIENT : Role.RECRUITER);
            const email = i === 0 ? 'admin@test.com' : `user${i}@test.com`;
            const nickname = i === 0 ? 'AdminUser' : `User ${i}`;

            await dataSource.getRepository(User).insert({
                id: userId,
                email,
                nickname,
                passwordHash,
                isActive: true,
                createdAt: new Date(Date.now() - i * 1000) // Ensure descending order by ID/Time
            });

            await dataSource.getRepository(UserRole).insert({
                userId,
                role
            });

            if (i === 0) {
                const loginRes = await request(app.getHttpServer())
                    .post('/auth/login/password')
                    .send({ email: 'admin@test.com', password: 'password123' });
                adminToken = loginRes.body.access_token;
            }
        }
    }

    it('GET /admin/users - should return first page with default limit 10', async () => {
        const res = await request(app.getHttpServer())
            .get('/admin/users')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(10);
        expect(res.body.total).toBe(15);
        expect(res.body.page).toBe(1);
        expect(res.body.limit).toBe(10);
        expect(res.body.totalPages).toBe(2);

        // Check structure of first item
        const firstUser = res.body.data[0];
        expect(firstUser).toHaveProperty('id');
        expect(firstUser).toHaveProperty('nickname');
        expect(firstUser).toHaveProperty('email');
        expect(firstUser).toHaveProperty('roles');
        expect(firstUser).toHaveProperty('isActive');
        expect(firstUser).toHaveProperty('createdAt');
        expect(firstUser).not.toHaveProperty('passwordHash');
        expect(firstUser).not.toHaveProperty('totpSecretEnc');
    });

    it('GET /admin/users?page=2&limit=5 - should return second page with limit 5', async () => {
        const res = await request(app.getHttpServer())
            .get('/admin/users?page=2&limit=5')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(5);
        expect(res.body.page).toBe(2);
        expect(res.body.limit).toBe(5);
        expect(res.body.total).toBe(15);
    });

    it('GET /admin/users?role=Client - should filter by role', async () => {
        const res = await request(app.getHttpServer())
            .get(`/admin/users?role=${Role.CLIENT}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        // 7 clients seeded (indices 2, 4, 6, 8, 10, 12, 14)
        expect(res.body.total).toBe(7);
        res.body.data.forEach(user => {
            expect(user.roles.some(r => r.role === Role.CLIENT)).toBeTruthy();
        });
    });

    it('GET /admin/users?search=User 1 - should search by nickname', async () => {
        const res = await request(app.getHttpServer())
            .get('/admin/users?search=User 1')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        // Should match "User 1", "User 10", "User 11", etc if we use LIKE
        expect(res.body.data.some(u => u.nickname.includes('User 1'))).toBeTruthy();
    });

    it('GET /admin/users?search=user1@test.com - should search by email', async () => {
        const res = await request(app.getHttpServer())
            .get('/admin/users?search=user1@test.com')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data[0].email).toBe('user1@test.com');
    });
});
