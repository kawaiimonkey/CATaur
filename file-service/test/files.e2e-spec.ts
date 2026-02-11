import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import * as fs from 'fs';
import * as path from 'path';

describe('FilesController (Integration)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            // 这里直接引入 AppModule，它会自动加载你的 ConfigModule 和 .env
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('/files/upload (POST) - 应将图片转换为高质量 AVIF', async () => {
        const testFilePath = path.join(__dirname, 'fixtures/text-screenshot.jpeg'); // 建议用带文字的图测试

        const response = await request(app.getHttpServer())
            .post('/files/upload')
            .attach('file', testFilePath)
            .expect(201);

        // 1. 验证后缀
        expect(response.body.url).toMatch(/\.avif$/);

        // 2. 验证预览接口返回的 MIME 类型
        const viewResponse = await request(app.getHttpServer())
            .get(response.body.url)
            .expect(200);

        expect(viewResponse.header['content-type']).toBe('image/avif');
    }, 30000);

    it('/files/upload (POST) - 未传文件应返回 400', () => {
        return request(app.getHttpServer())
            .post('/files/upload')
            .expect(400);
    });

    afterAll(async () => {
        await app.close();
    });
});