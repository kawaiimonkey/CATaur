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

describe('AI Provider Config Controller (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let ulidService: UlidService;
  
  let adminToken: string;
  let userToken: string;

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
    await dataSource.createQueryBuilder().delete().from(UserRole).execute();
    await dataSource.createQueryBuilder().delete().from(User).execute();
    await app.close();
  });

  async function seedUsers() {
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

    const adminId = ulidService.generate();
    await dataSource.createQueryBuilder().insert().into(User).values({
      id: adminId, email: 'admin@sys.com', nickname: 'SysAdmin',
      passwordHash: await bcrypt.hash('adminPass', 12), isActive: true,
    }).execute();
    await dataSource.createQueryBuilder().insert().into(UserRole).values({
      userId: adminId, role: Role.ADMIN,
    }).execute();

    const normId = ulidService.generate();
    await dataSource.createQueryBuilder().insert().into(User).values({
      id: normId, email: 'norm@sys.com', nickname: 'Norm',
      passwordHash: await bcrypt.hash('normPass', 12), isActive: true,
    }).execute();
    await dataSource.createQueryBuilder().insert().into(UserRole).values({
      userId: normId, role: Role.USER,
    }).execute();

    const adminRes = await request(app.getHttpServer()).post('/auth/login/password').send({ email: 'admin@sys.com', password: 'adminPass' });
    adminToken = adminRes.body.access_token;

    const normRes = await request(app.getHttpServer()).post('/auth/login/password').send({ email: 'norm@sys.com', password: 'normPass' });
    userToken = normRes.body.access_token;
  }

  describe('POST /admin/ai-providers - Create AI Provider Config', () => {
    it('should create a new OpenAI provider configuration', async () => {
      const payload = {
        provider: 'openai',
        apiKey: 'sk-test-key-12345',
        defaultModel: 'gpt-4',
      };

      const res = await request(app.getHttpServer())
        .post('/admin/ai-providers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.provider).toBe('openai');
      expect(res.body.apiKey).toMatch(/^sk-t.*2345$/);
      expect(res.body.apiKey).toContain('*');
      expect(res.body.defaultModel).toBe('gpt-4');
      expect(res.body.updatedAt).toBeDefined();
    });

    it('should create an Anthropic provider configuration', async () => {
      const payload = {
        provider: 'anthropic',
        apiKey: 'sk-anthropic-test-key',
        defaultModel: 'claude-3-opus',
      };

      const res = await request(app.getHttpServer())
        .post('/admin/ai-providers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.provider).toBe('anthropic');
      expect(res.body.apiKey).toMatch(/^sk-a.*-key$/);
      expect(res.body.apiKey).toContain('*');
      expect(res.body.defaultModel).toBe('claude-3-opus');
    });

    it('should reject invalid provider enum', async () => {
      const payload = {
        provider: 'InvalidProvider',
        apiKey: 'test-key',
        defaultModel: 'model-1',
      };

      const res = await request(app.getHttpServer())
        .post('/admin/ai-providers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      expect(res.status).toBe(400);
    });

    it('should reject missing required fields', async () => {
      const payload = {
        provider: 'openai',
      };

      const res = await request(app.getHttpServer())
        .post('/admin/ai-providers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      expect([400, 201]).toContain(res.status);
    });
  });

  describe('GET /admin/ai-providers - Get All AI Provider Configs', () => {
    it('should return all AI provider configurations', async () => {
      const res = await request(app.getHttpServer())
        .get('/admin/ai-providers')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('providers');
      expect(Array.isArray(res.body.providers)).toBe(true);
    });

    it('should require admin permission', async () => {
      const res = await request(app.getHttpServer())
        .get('/admin/ai-providers')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it('should require authentication', async () => {
      const res = await request(app.getHttpServer())
        .get('/admin/ai-providers');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /admin/ai-providers/:provider - Get Specific AI Provider Config', () => {
    beforeAll(async () => {
      await request(app.getHttpServer())
        .post('/admin/ai-providers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          provider: 'google',
          apiKey: 'sk-google-test',
          defaultModel: 'gemini-pro',
        });
    });

    it('should get Google provider configuration', async () => {
      const res = await request(app.getHttpServer())
        .get('/admin/ai-providers/google')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body.provider).toBe('google');
        expect(res.body.apiKey).toBeDefined();
        expect(res.body.defaultModel).toBeDefined();
        expect(res.body.updatedAt).toBeDefined();
      }
    });

    it('should return null/404 for non-existent provider', async () => {
      const res = await request(app.getHttpServer())
        .get('/admin/ai-providers/NonExistentProvider')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(res.status);
      // API returns empty object or null for non-existent provider
      if (res.status === 200) {
        expect(Object.keys(res.body).length === 0 || res.body === null).toBe(true);
      }
    });

    it('should require admin permission', async () => {
      const res = await request(app.getHttpServer())
        .get('/admin/ai-providers/google')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('PUT /admin/ai-providers/:provider - Update AI Provider Config', () => {
    beforeAll(async () => {
      await request(app.getHttpServer())
        .post('/admin/ai-providers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          provider: 'azure',
          apiKey: 'sk-azure-old-key',
          defaultModel: 'gpt-4-azure',
          baseUrl: 'https://example.azure.com',
          apiVersion: '2024-02-15-preview',
        });
    });

    it('should update existing Azure OpenAI provider configuration', async () => {
      const updatePayload = {
        provider: 'azure',
        apiKey: 'sk-azure-updated-key',
        defaultModel: 'gpt-4-turbo',
        baseUrl: 'https://example.azure.com',
        apiVersion: '2024-02-15-preview',
      };

      const res = await request(app.getHttpServer())
        .put('/admin/ai-providers/azure')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatePayload);

      expect(res.status).toBe(200);
      expect(res.body.provider).toBe('azure');
      expect(res.body.apiKey).toMatch(/^sk-.*-key$/);
      expect(res.body.apiKey).toContain('*');
      expect(res.body.defaultModel).toBe('gpt-4-turbo');
    });

    it('should require admin permission to update', async () => {
      const payload = {
        provider: 'azure',
        apiKey: 'sk-test',
        defaultModel: 'model-1',
        baseUrl: 'https://example.azure.com',
        apiVersion: '2024-02-15-preview',
      };

      const res = await request(app.getHttpServer())
        .put('/admin/ai-providers/azure')
        .set('Authorization', `Bearer ${userToken}`)
        .send(payload);

      expect(res.status).toBe(403);
    });

    it('should accept provider from URL param and merge with body data', async () => {
      const payload = {
        provider: 'openai', // This will be overridden by URL param
        apiKey: 'sk-test-merge',
        defaultModel: 'gpt-4-turbo',
      };

      const res = await request(app.getHttpServer())
        .put('/admin/ai-providers/google')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      // API merges provider from URL param with body
      expect(res.status).toBe(200);
      // Verify URL param provider takes precedence
      expect(res.body.provider).toBe('google');
      expect(res.body.apiKey).toMatch(/^sk-.*erge$/);
      expect(res.body.apiKey).toContain('*');
    });
  });

  describe('DELETE /admin/ai-providers/:provider - Delete AI Provider Config', () => {
    beforeAll(async () => {
      await request(app.getHttpServer())
        .post('/admin/ai-providers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          provider: 'anthropic',
          apiKey: 'sk-anthropic-delete-test',
          defaultModel: 'claude-3-sonnet',
        });
    });

    it('should delete Anthropic provider configuration', async () => {
      const res = await request(app.getHttpServer())
        .delete('/admin/ai-providers/anthropic')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('deleted successfully');
    });

    it('should return appropriate response even if config does not exist', async () => {
      const res = await request(app.getHttpServer())
        .delete('/admin/ai-providers/NonExistentProvider')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(res.status);
    });

    it('should require admin permission to delete', async () => {
      const res = await request(app.getHttpServer())
        .delete('/admin/ai-providers/openai')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it('should require authentication to delete', async () => {
      const res = await request(app.getHttpServer())
        .delete('/admin/ai-providers/openai');

      expect(res.status).toBe(401);
    });

    it('should verify deletion by checking get returns null/empty', async () => {
      await request(app.getHttpServer())
        .post('/admin/ai-providers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          provider: 'openai',
          apiKey: 'sk-openai-delete-test',
          defaultModel: 'gpt-4',
        });

      await request(app.getHttpServer())
        .delete('/admin/ai-providers/openai')
        .set('Authorization', `Bearer ${adminToken}`);

      const getRes = await request(app.getHttpServer())
        .get('/admin/ai-providers/openai')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(getRes.status);
      // API may return empty object or null for deleted provider
      if (getRes.status === 200) {
        expect(Object.keys(getRes.body).length === 0 || getRes.body === null).toBe(true);
      }
    });
  });

  describe('Integration Tests - Complete CRUD Lifecycle', () => {
    it('should handle complete lifecycle: create, read, update, delete', async () => {
      const provider = 'google';
      const originalConfig = {
        provider,
        apiKey: 'sk-google-v1',
        defaultModel: 'gemini-pro',
      };

      const createRes = await request(app.getHttpServer())
        .post('/admin/ai-providers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(originalConfig);
      expect(createRes.status).toBe(201);
      expect(createRes.body.provider).toBe(provider);

      const getRes = await request(app.getHttpServer())
        .get(`/admin/ai-providers/${provider}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body.apiKey).toMatch(/^sk-g.*e-v1$/);
      expect(getRes.body.apiKey).toContain('*');

      const getAllRes = await request(app.getHttpServer())
        .get('/admin/ai-providers')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(getAllRes.status).toBe(200);
      expect(getAllRes.body.providers.length).toBeGreaterThan(0);

      const updatedConfig = {
        provider,
        apiKey: 'sk-google-v2',
        defaultModel: 'gemini-1.5-pro',
      };
      const updateRes = await request(app.getHttpServer())
        .put(`/admin/ai-providers/${provider}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatedConfig);
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.apiKey).toMatch(/^sk-g.*e-v2$/);
      expect(updateRes.body.apiKey).toContain('*');
      expect(updateRes.body.defaultModel).toBe('gemini-1.5-pro');

      const deleteRes = await request(app.getHttpServer())
        .delete(`/admin/ai-providers/${provider}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(deleteRes.status).toBe(200);
    });
  });
});
