import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';

describe('FilesService', () => {
    let service: FilesService;
    let httpService: any;
    let configService: any;

    beforeEach(async () => {
        const mockHttpService = {
            get: jest.fn(),
        };
        const mockConfigService = {
            get: jest.fn((key: string) => {
                if (key === 'FILE_SERVICE_URL') return 'http://file-service';
                if (key === 'FILE_SERVICE_KEY') return 'test_key';
                return null;
            }),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FilesService,
                { provide: HttpService, useValue: mockHttpService },
                { provide: ConfigService, useValue: mockConfigService },
            ],
        }).compile();

        service = module.get<FilesService>(FilesService);
        httpService = module.get<HttpService>(HttpService);
        configService = module.get<ConfigService>(ConfigService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getUploadUrl', () => {
        it('should call external file service with correct params and return data', async () => {
            const filename = 'test.png';
            const mockResponse = { data: { uploadUrl: '/upload', params: {} } };

            httpService.get.mockReturnValue(of(mockResponse));

            const result = await service.getUploadUrl(filename);

            expect(result).toEqual(mockResponse.data);
            expect(httpService.get).toHaveBeenCalledWith('http://file-service/files/request-upload', {
                params: { filename, key: 'test_key' },
            });
        });
    });
});
