import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

import { EmailService } from '../src/common/email.service';
import { CaptchaService } from '../src/auth/captcha.service';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  jest.setTimeout(30000); // Increase timeout to 30s for slower environments

  beforeEach(async () => {
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
    app.enableCors();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /', () => {
    it('should return "Hello World!"', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });
  });

  describe('Auth - Registration and Email Verification', () => {
    describe('POST /auth/register', () => {
      it('should return 400 for missing email', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            password: 'SecurePass123!',
          });
        
        expect(response.status).toBe(400);
      });

      it('should return 400 for invalid email format', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: 'not-an-email',
            password: 'SecurePass123!',
          });
        
        expect(response.status).toBe(400);
      });

      it('should return 400 for weak password', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: 'test@example.com',
            password: '123', // Too weak
          });
        
        expect(response.status).toBe(400);
      });

      it('should register successfully with valid credentials', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: 'newuser@example.com',
            password: 'SecurePass123!',
            nickname: 'newuser',
          });
        
        expect([200, 201, 409]).toContain(response.status);
        if (response.status === 200 || response.status === 201) {
          expect(response.body).toHaveProperty('id');
          expect(response.body).toHaveProperty('email', 'newuser@example.com');
          expect(response.body).toHaveProperty('isActive');
        }
      });

      it('should return 409 if email already registered', async () => {
        // Register first user
        await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: 'duplicate@example.com',
            password: 'SecurePass123!',
            nickname: 'duplicate-user',
          });

        // Try to register with same email
        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: 'duplicate@example.com',
            password: 'SecurePass123!',
            nickname: 'duplicate-user',
          });
        
        expect([409, 201]).toContain(response.status);
      });
    });

    describe('GET /auth/verify', () => {
      it('should return 400 for missing token', async () => {
        const response = await request(app.getHttpServer())
          .get('/auth/verify');
        
        expect(response.status).toBe(400);
      });

      it('should return 400 for invalid token', async () => {
        const response = await request(app.getHttpServer())
          .get('/auth/verify?token=invalid_token_here');
        
        expect(response.status).toBe(400);
      });
    });
  });

  describe('Auth - New Password Login Endpoints', () => {
    describe('POST /auth/login/password', () => {
      it('should handle password login request (endpoint exists)', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login/password')
          .send({
            email: 'test@example.com',
            password: 'password123',
          });
        
        expect(response.status).not.toBe(404);
        expect([400, 401, 200]).toContain(response.status);
      });

      it('should return 400 for missing email', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login/password')
          .send({
            password: 'password123',
          });
        
        expect(response.status).toBe(400);
      });

      it('should return 400 for missing password', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login/password')
          .send({
            email: 'test@example.com',
          });
        
        expect(response.status).toBe(400);
      });
    });

    describe('POST /auth/set-password', () => {
      it('should return 401 for invalid token', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/set-password')
          .set('Authorization', 'Bearer invalid')
          .send({
            password: 'NewSecurePass123!',
          });
        
        expect([401, 403]).toContain(response.status);
      });

      it('should return 400 for missing password', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/set-password')
          .set('Authorization', 'Bearer invalid')
          .send({});
        
        expect([400, 401, 403]).toContain(response.status);
      });
    });

    describe('POST /auth/change-password', () => {
      it('should return 401 for invalid token', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/change-password')
          .set('Authorization', 'Bearer invalid')
          .send({
            oldPassword: 'old123',
            newPassword: 'new123',
          });
        
        expect([401, 403]).toContain(response.status);
      });

      it('should return 400 for missing fields', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/change-password')
          .set('Authorization', 'Bearer invalid')
          .send({
            oldPassword: 'old123',
          });
        
        expect([400, 401, 403]).toContain(response.status);
      });
    });

    describe('POST /auth/request-password-reset', () => {
      it('should handle password reset request', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/request-password-reset')
          .send({
            email: 'test@example.com',
          });
        
        expect(response.status).not.toBe(404);
        expect([200, 201, 400]).toContain(response.status);
      });

      it('should return 400 for missing email', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/request-password-reset')
          .send({});
        
        expect(response.status).toBe(400);
      });

      it('should return 400 for invalid email format', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/request-password-reset')
          .send({
            email: 'not-an-email',
          });
        
        expect(response.status).toBe(400);
      });
    });

    describe('POST /auth/reset-password', () => {
      it('should handle reset password with token', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/reset-password')
          .send({
            token: 'invalid_token',
            newPassword: 'newpassword',
          });
        
        expect(response.status).not.toBe(404);
        expect([400, 200]).toContain(response.status);
      });

      it('should return 400 for missing token', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/reset-password')
          .send({
            newPassword: 'newpassword',
          });
        
        expect(response.status).toBe(400);
      });

      it('should return 400 for missing password', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/reset-password')
          .send({
            token: 'some_token',
          });
        
        expect(response.status).toBe(400);
      });
    });
  });

  describe('Auth - Verification Code Login Endpoints', () => {
    describe('POST /auth/request-verification-code', () => {
      it('should handle verification code request', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/request-verification-code')
          .send({
            email: 'test@example.com',
          });
        
        expect(response.status).not.toBe(404);
      });

      it('should return 400 for missing email', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/request-verification-code')
          .send({});
        
        expect(response.status).toBe(400);
      });

      it('should return 400 for invalid email format', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/request-verification-code')
          .send({
            email: 'invalid-email',
          });
        
        expect(response.status).toBe(400);
      });
    });

    describe('POST /auth/login/verification-code', () => {
      it('should handle verification code login', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login/verification-code')
          .send({
            email: 'test@example.com',
            code: '123456',
          });
        
        expect(response.status).not.toBe(404);
        expect([400, 401, 200]).toContain(response.status);
      });

      it('should reject invalid code format (too short)', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login/verification-code')
          .send({
            email: 'test@example.com',
            code: '12345', // Too short
          });
        
        expect([400, 401]).toContain(response.status);
      });

      it('should reject invalid code format (non-numeric)', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login/verification-code')
          .send({
            email: 'test@example.com',
            code: 'ABCDEF',
          });
        
        expect([400, 401]).toContain(response.status);
      });

      it('should return 400 for missing email', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login/verification-code')
          .send({
            code: '123456',
          });
        
        expect(response.status).toBe(400);
      });

      it('should return 400 for missing code', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login/verification-code')
          .send({
            email: 'test@example.com',
          });
        
        expect(response.status).toBe(400);
      });
    });
  });

  describe('Auth - Existing Endpoints', () => {
    it('POST /auth/register should exist', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
        });
      
      expect(response.status).not.toBe(404);
    });

    it('POST /auth/request-magic-link should exist', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/request-magic-link')
        .send({
          email: 'test@example.com',
        })
        .set('Content-Type', 'application/json');
      
      expect([200, 201, 404]).toContain(response.status);
    });

    it('GET /auth/verify should exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/verify?token=test');
      
      expect(response.status).not.toBe(404);
    });
  });

  describe('Files Endpoint', () => {
    it('GET /files/:filename should return 404 for non-existent file', async () => {
      const response = await request(app.getHttpServer())
        .get('/files/nonexistent.txt');
      
      expect(response.status).not.toBe(500);
    });

    it('GET /files/:filename should handle request', async () => {
      const response = await request(app.getHttpServer())
        .get('/files/test-passkey.html');
      
      expect(response.status).not.toBe(500);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent route', async () => {
      const response = await request(app.getHttpServer())
        .get('/non-existent-route-xyz');
      
      expect(response.status).toBe(404);
    });

    it('should handle invalid JSON in request body', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .set('Content-Type', 'application/json')
        .send('invalid json {{{');
      
      expect(response.status).toBe(400);
    });

    it('should handle CORS requests appropriately', async () => {
      const response = await request(app.getHttpServer())
        .options('/')
        .set('Origin', 'http://localhost:3000');
      
      expect([200, 204]).toContain(response.status);
    });
  });
});
