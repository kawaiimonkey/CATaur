import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
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
        
        // Should return either 401 (invalid credentials) or success, not 404
        expect(response.status).not.toBe(404);
      });
    });

    describe('POST /auth/set-password', () => {
      it('should handle set password request (endpoint exists)', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/set-password')
          .set('Authorization', 'Bearer invalid')
          .send({
            password: 'password123',
          });
        
        // Should return auth error, not 404
        expect(response.status).not.toBe(404);
      });
    });

    describe('POST /auth/change-password', () => {
      it('should handle change password request (endpoint exists)', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/change-password')
          .set('Authorization', 'Bearer invalid')
          .send({
            oldPassword: 'old123',
            newPassword: 'new123',
          });
        
        // Should return auth error, not 404
        expect(response.status).not.toBe(404);
      });
    });

    describe('POST /auth/request-password-reset', () => {
      it('should handle password reset request (endpoint exists)', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/request-password-reset')
          .send({
            email: 'test@example.com',
          });
        
        // Should be handled, not 404
        expect(response.status).not.toBe(404);
      });
    });

    describe('POST /auth/reset-password', () => {
      it('should handle reset password with token (endpoint exists)', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/reset-password')
          .send({
            token: 'invalid_token',
            newPassword: 'newpassword',
          });
        
        // Should return validation/auth error, not 404
        expect(response.status).not.toBe(404);
      });
    });
  });

  describe('Auth - New Verification Code Login Endpoints', () => {
    describe('POST /auth/request-verification-code', () => {
      it('should handle verification code request (endpoint exists)', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/request-verification-code')
          .send({
            email: 'test@example.com',
          });
        
        // Should be handled, not 404
        expect(response.status).not.toBe(404);
      });
    });

    describe('POST /auth/login/verification-code', () => {
      it('should handle verification code login (endpoint exists)', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login/verification-code')
          .send({
            email: 'test@example.com',
            code: '123456',
          });
        
        // Should be handled, not 404
        expect(response.status).not.toBe(404);
      });

      it('should reject invalid code format', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login/verification-code')
          .send({
            email: 'test@example.com',
            code: '12345', // Too short
          });
        
        // Should return 400 validation error
        expect([400, 401]).toContain(response.status);
      });
    });
  });

  describe('Existing Auth Endpoints Still Work', () => {
    it('POST /auth/register should exist', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
        });
      
      // Should not be 404
      expect(response.status).not.toBe(404);
    });

    it('POST /auth/request-magic-link should exist', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/request-magic-link')
        .send({
          email: 'test@example.com',
        })
        .set('Content-Type', 'application/json');
      
      // Should not be 404
      expect(response.status).not.toBe(404);
    });

    it('GET /auth/verify should exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/verify?token=test');
      
      // Should not be 404
      expect(response.status).not.toBe(404);
    });
  });
});
