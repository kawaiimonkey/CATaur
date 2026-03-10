import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { User } from '../src/database/entities/user.entity';
import { UserRole, Role } from '../src/database/entities/user-role.entity';
import { Company } from '../src/database/entities/company.entity';
import * as bcrypt from 'bcrypt';
import { UlidService } from '../src/common/ulid.service';
import { EmailService } from '../src/common/email.service';
import { CaptchaService } from '../src/auth/captcha.service';

describe('AdminController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let ulidService: UlidService;
  
  let adminToken: string;
  let userToken: string;
  let clientToken: string;

  let testUserId: string;
  let testCompanyId: string;

  beforeAll(async () => {
    const mockEmailService = {
      sendVerificationEmail: jest.fn().mockResolvedValue(true),
      sendVerificationCodeEmail: jest.fn().mockResolvedValue(true),
      sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
      sendPasswordChangedNotification: jest.fn().mockResolvedValue(true),
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
    app.enableCors();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    dataSource = app.get(getDataSourceToken());
    ulidService = app.get(UlidService);

    await seedUsers();
  });

  afterAll(async () => {
    // Teardown db
    await dataSource.createQueryBuilder().delete().from(Company).execute();
    await dataSource.createQueryBuilder().delete().from(UserRole).execute();
    await dataSource.createQueryBuilder().delete().from(User).execute();
    await app.close();
  });

  async function seedUsers() {
    // Clean up first in case a previous test run aborted and left dirty data
    const existingAdmin = await dataSource.getRepository(User).findOne({ where: { email: 'admin@sys.com' } });
    if (existingAdmin) {
      await dataSource.getRepository(UserRole).delete({ userId: existingAdmin.id });
      await dataSource.getRepository(User).delete({ id: existingAdmin.id });
    }
    const existingNorm = await dataSource.getRepository(User).findOne({ where: { email: 'norm@sys.com' } });
    if (existingNorm) {
      await dataSource.getRepository(UserRole).delete({ userId: existingNorm.id });
      await dataSource.getRepository(User).delete({ id: existingNorm.id });
    }

    // Create Admin User
    const adminId = ulidService.generate();
    await dataSource.createQueryBuilder().insert().into(User).values({
      id: adminId, email: 'admin@sys.com', nickname: 'SysAdmin',
      passwordHash: await bcrypt.hash('adminPass', 12), isActive: true,
    }).execute();
    await dataSource.createQueryBuilder().insert().into(UserRole).values({
      userId: adminId, role: Role.ADMIN,
    }).execute();

    // Create Normal User
    const normId = ulidService.generate();
    await dataSource.createQueryBuilder().insert().into(User).values({
      id: normId, email: 'norm@sys.com', nickname: 'Norm',
      passwordHash: await bcrypt.hash('normPass', 12), isActive: true,
    }).execute();
    await dataSource.createQueryBuilder().insert().into(UserRole).values({
      userId: normId, role: Role.USER,
    }).execute();

    // Generate tokens via local Auth endpoint login (shortcut)
    const adminRes = await request(app.getHttpServer()).post('/auth/login/password').send({ email: 'admin@sys.com', password: 'adminPass' });
    adminToken = adminRes.body.access_token;

    const normRes = await request(app.getHttpServer()).post('/auth/login/password').send({ email: 'norm@sys.com', password: 'normPass' });
    userToken = normRes.body.access_token;
  }

  describe('Security & RBAC checks', () => {
    it('should block unauthenticated requests', async () => {
      const response = await request(app.getHttpServer()).get('/admin/users');
      expect(response.status).toBe(401);
    });

    it('should block non-admin users', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${userToken}`);
      expect(response.status).toBe(403);
    });

    it('should allow admin users', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('Module 1: Users CRUD', () => {
    it('POST /admin/users - should create a new CLIENT user', async () => {
      const payload = {
        accountName: 'Headhunter Bob',
        email: 'bob@headhunter.com',
        password: 'SecurePassword123!',
        role: Role.CLIENT,
        phone: '1234567890',
      };
      const createRes = await request(app.getHttpServer())
        .post('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      expect([200, 201]).toContain(createRes.status);

      const lookupRes = await request(app.getHttpServer())
        .get('/admin/users?search=bob@headhunter.com')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(lookupRes.status).toBe(200);
      const createdUser = lookupRes.body.data.find(user => user.email === payload.email);
      expect(createdUser).toBeDefined();
      expect(createdUser.nickname).toBe(payload.accountName);
      expect(createdUser.roles.some(r => r.role === Role.CLIENT)).toBe(true);
      testUserId = createdUser.id;
    });

    it('GET /admin/users - should fetch users with search filter', async () => {
      const res = await request(app.getHttpServer())
        .get(`/admin/users?search=bob@head`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data.some(user => user.id === testUserId)).toBe(true);
    });

    it('PUT /admin/users/:id - should update user attributes', async () => {
      const updateRes = await request(app.getHttpServer())
        .put(`/admin/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ accountName: 'Bob Updated', isActive: false });

      expect(updateRes.status).toBe(200);

      const lookupRes = await request(app.getHttpServer())
        .get('/admin/users?search=bob@headhunter.com')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(lookupRes.status).toBe(200);
      const updatedUser = lookupRes.body.data.find(user => user.id === testUserId);
      expect(updatedUser).toBeDefined();
      expect(updatedUser.nickname).toBe('Bob Updated');
      expect(updatedUser.isActive).toBe(false);
    });
  });

  describe('Module 5: Companies CRUD', () => {
    it('POST /admin/companies - should create a new company linked to the Client', async () => {
      const payload = {
        name: 'Tech Innovators Inc.',
        email: 'contact@techinnovators.com',
        clientAccountId: testUserId,
        location: 'New York',
      };
      const res = await request(app.getHttpServer())
        .post('/admin/companies')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      expect([200, 201]).toContain(res.status);
      const createdCompany = res.body;
      expect(createdCompany.name).toBe(payload.name);
      testCompanyId = createdCompany.id;
      expect(testCompanyId).toBeDefined();
    });

    it('GET /admin/companies - should list the created company', async () => {
      const res = await request(app.getHttpServer())
        .get(`/admin/companies`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.some(c => c.id === testCompanyId)).toBe(true);
    });

    it('PUT /admin/companies/:id - should update the company unlinking the client', async () => {
      const res = await request(app.getHttpServer())
        .put(`/admin/companies/${testCompanyId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ clientAccountId: null, name: 'Tech Innovators LLC' });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Tech Innovators LLC');
      expect(res.body.clientId).toBeNull();
    });

    it('DELETE /admin/companies/:id - should delete company', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/admin/companies/${testCompanyId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });
  });

  describe('Module 2 & 3: Configs', () => {
    it('PUT /admin/configs/:category - should update config records', async () => {
      const payload = {
        configs: [
          { key: 'TEST_KEY', value: 'TEST_VALUE' }
        ]
      };
      const res = await request(app.getHttpServer())
        .put('/admin/configs/AI')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].key).toBe('TEST_KEY');
      expect(res.body[0].value).toBe('TEST_VALUE');
    });

    it('GET /admin/configs/:category - should fetch configs', async () => {
      const res = await request(app.getHttpServer())
        .get('/admin/configs/AI')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.some(c => c.key === 'TEST_KEY')).toBe(true);
    });
  });

  describe('Module 4: Activity Logs', () => {
    it('GET /admin/audit-logs - should return logs captured by Interceptor', async () => {
      const res = await request(app.getHttpServer())
        .get('/admin/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);

      const logTypes = res.body.data.map(log => log.actionType);
      expect(logTypes.length).toBeGreaterThan(0);
    });
  });
});
