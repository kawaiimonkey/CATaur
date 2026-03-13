import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { EmailService } from '../src/common/email.service';
import { CaptchaService } from '../src/auth/captcha.service';
import { AiChatService } from '../src/ai/ai-chat.service';

describe('AI Chat Completions (e2e)', () => {
  let app: INestApplication<App>;

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
      .overrideProvider(AiChatService)
      .useValue({
        createChatCompletion: jest.fn().mockResolvedValue({
          provider: 'openai',
          model: 'gpt-4o-mini',
          outputText: 'stubbed',
          finishReason: 'stop',
          usage: { inputTokens: 1, outputTokens: 2, totalTokens: 3 },
        }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.enableCors();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /ai/chat/completions should require JWT', async () => {
    const response = await request(app.getHttpServer())
      .post('/ai/chat/completions')
      .send({
        provider: 'openai',
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'hi' }],
      });

    expect([401, 403]).toContain(response.status);
  });
});
