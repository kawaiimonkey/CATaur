import { Test, TestingModule } from '@nestjs/testing';
import { FilesController } from './files.controller';
import { ConfigService } from '@nestjs/config';
import { HttpException } from '@nestjs/common';
import axios from 'axios';
import sharp from 'sharp';
import { Response } from 'express';

// Mock dependencies
jest.mock('axios');
jest.mock('sharp');

describe('FilesController', () => {
    let controller: FilesController;
    let configService: ConfigService;

    const mockConfigService = {
        get: jest.fn((key: string) => {
            if (key === 'SEAWEEDFS_FILER_URL') return 'http://mock-filer:8888';
            return null;
        }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [FilesController],
            providers: [
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        controller = module.get<FilesController>(FilesController);
        configService = module.get<ConfigService>(ConfigService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('upload', () => {
        it('should throw HttpException if no file is provided', async () => {
            await expect(controller.upload(undefined)).rejects.toThrow(
                new HttpException('No file', 400),
            );
        });

        it('should upload a non-image file successfully', async () => {
            const file = {
                buffer: Buffer.from('test content'),
                originalname: 'test.txt',
                mimetype: 'text/plain',
            } as Express.Multer.File;

            (axios.post as jest.Mock).mockResolvedValue({ status: 201 });

            const result = await controller.upload(file);

            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('http://mock-filer:8888/uploads/'),
                expect.any(Object),
                expect.any(Object),
            );
            expect(result).toHaveProperty('url');
            expect(result).toHaveProperty('mimetype', 'text/plain');
        });

        it('should process and upload an image file successfully', async () => {
            const file = {
                buffer: Buffer.from('image content'),
                originalname: 'test.png',
                mimetype: 'image/png',
            } as Express.Multer.File;

            const mockBuffer = Buffer.from('processed image');
            // Mock chainable sharp methods
            const sharpMock = {
                resize: jest.fn().mockReturnThis(),
                jpeg: jest.fn().mockReturnThis(),
                toBuffer: jest.fn().mockResolvedValue(mockBuffer),
            };
            (sharp as unknown as jest.Mock).mockReturnValue(sharpMock);

            (axios.post as jest.Mock).mockResolvedValue({ status: 201 });

            const result = await controller.upload(file);

            expect(sharp).toHaveBeenCalled();
            expect(sharpMock.resize).toHaveBeenCalledWith(1200, null, {
                withoutEnlargement: true,
            });
            expect(sharpMock.jpeg).toHaveBeenCalledWith({ quality: 80 });
            expect(axios.post).toHaveBeenCalled();
            expect(result.url).toMatch(/\.jpg$/);
            expect(result.mimetype).toBe('image/png');
        });

        it('should throw SeaweedFS Upload Error if upload fails', async () => {
            const file = {
                buffer: Buffer.from('test content'),
                originalname: 'test.txt',
                mimetype: 'text/plain',
            } as Express.Multer.File;

            (axios.post as jest.Mock).mockRejectedValue(new Error('Upload failed'));

            await expect(controller.upload(file)).rejects.toThrow(
                new HttpException('SeaweedFS Upload Error', 500),
            );
        });
    });

    describe('view', () => {
        it('should pipe the file stream to response on success', async () => {
            const mockStream = {
                pipe: jest.fn(),
                headers: { 'content-type': 'text/plain' },
                data: {
                    pipe: jest.fn(),
                },
            };
            const res = {
                setHeader: jest.fn(),
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            } as unknown as Response;

            (axios as unknown as jest.Mock).mockResolvedValue(mockStream);

            await controller.view('test.txt', res);

            expect(axios).toHaveBeenCalledWith({
                url: 'http://mock-filer:8888/uploads/test.txt',
                method: 'GET',
                responseType: 'stream',
            });
            expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/plain');
            expect(mockStream.data.pipe).toHaveBeenCalledWith(res);
        });

        it('should respond with 404 if file not found', async () => {
            const res = {
                setHeader: jest.fn(),
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            } as unknown as Response;

            (axios as unknown as jest.Mock).mockRejectedValue(new Error('Not found'));

            await controller.view('nonexistent.txt', res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith('Not Found');
        });
    });
});
