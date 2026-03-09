import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EncryptionService } from './encryption.service';

describe('EncryptionService', () => {
    let service: EncryptionService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EncryptionService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: (key: string) => {
                            if (key === 'FIELD_ENC_KEY') {
                                return Buffer.alloc(32, 7).toString('base64');
                            }
                            return undefined;
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<EncryptionService>(EncryptionService);
    });

    it('encrypts and decrypts text', () => {
        const encrypted = service.encryptText('hello world');

        expect(Buffer.isBuffer(encrypted)).toBe(true);
        expect(service.decryptText(encrypted)).toBe('hello world');
    });

    it('encrypts and decrypts json payloads', () => {
        const source = {
            fullName: 'Jane Doe',
            skills: ['NestJS', 'MariaDB'],
        };

        const encrypted = service.encryptJson(source);
        const decrypted = service.decryptJson<typeof source>(encrypted);

        expect(decrypted).toEqual(source);
    });
});
