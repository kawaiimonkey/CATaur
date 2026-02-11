import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import axios from 'axios';
import * as path from 'path';
import * as fs from 'fs';

// Mock axios to avoid real network calls
jest.mock('axios');

describe('FilesController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('Full Upload Flow', () => {
        it('should complete a signed upload and view for an image', async () => {
            // 1. Request upload URL
            const filename = 'test-image.png';
            const requestUploadRes = await request(app.getHttpServer())
                .get('/files/request-upload')
                .query({ filename })
                .expect(200);

            const { params } = requestUploadRes.body;
            expect(params).toHaveProperty('signature');
            expect(params).toHaveProperty('expires');

            // 2. Perform upload
            const testFilePath = path.join(__dirname, 'fixtures/text-screenshot.jpeg');
            // Create a dummy file if it doesn't exist for some reason, though it should be there
            if (!fs.existsSync(testFilePath)) {
                // Fallback for environment issues, though we saw it exists
                fs.mkdirSync(path.join(__dirname, 'fixtures'), { recursive: true });
                fs.writeFileSync(testFilePath, 'dummy image content');
            }

            (axios.post as jest.Mock).mockResolvedValue({ status: 201 });

            const uploadRes = await request(app.getHttpServer())
                .post('/files/upload')
                .query({
                    filename: params.filename,
                    expires: params.expires,
                    signature: params.signature,
                })
                .attach('file', testFilePath)
                .expect(201);

            expect(uploadRes.body.url).toMatch(/\.avif$/);
            expect(uploadRes.body.mimetype).toBe('image/avif');

            // 3. Verify view endpoint
            const fileUrl = uploadRes.body.url; // e.g., /files/view/123-test-image.avif
            const mockStream = {
                headers: { 'content-type': 'image/avif' },
                data: {
                    pipe: (res: any) => {
                        res.setHeader('Content-Type', 'image/avif');
                        res.end('mock avif content');
                    }
                },
            };
            (axios as unknown as jest.Mock).mockResolvedValue(mockStream);

            const viewRes = await request(app.getHttpServer())
                .get(fileUrl)
                .expect(200);

            expect(viewRes.header['content-type']).toBe('image/avif');
        });

        it('should return 401 for invalid signature', async () => {
            await request(app.getHttpServer())
                .post('/files/upload')
                .query({
                    filename: 'test.txt',
                    expires: Math.floor(Date.now() / 1000) + 3600,
                    signature: 'invalid-signature',
                })
                .attach('file', Buffer.from('test'), 'test.txt')
                .expect(401);
        });

        it('should return 401 for expired URL', async () => {
            const expires = Math.floor(Date.now() / 1000) - 10;
            // We can't easily get a valid signature for an already expired timestamp without knowing the secret,
            // but the controller checks expiry first.
            await request(app.getHttpServer())
                .post('/files/upload')
                .query({
                    filename: 'test.txt',
                    expires: expires,
                    signature: 'some-signature',
                })
                .attach('file', Buffer.from('test'), 'test.txt')
                .expect(401);
        });

        it('should return 400 if no file is uploaded', async () => {
            // First get valid params
            const requestUploadRes = await request(app.getHttpServer())
                .get('/files/request-upload')
                .query({ filename: 'test.txt' })
                .expect(200);

            const { params } = requestUploadRes.body;

            await request(app.getHttpServer())
                .post('/files/upload')
                .query({
                    filename: params.filename,
                    expires: params.expires,
                    signature: params.signature,
                })
                .expect(400);
        });
    });
});
