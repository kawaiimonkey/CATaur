import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { EmailService } from '../common/email.service';
import { UlidService } from '../common/ulid.service';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Passkey } from '../database/entities/passkey.entity';



describe('AuthService', () => {
    let service: AuthService;
    let usersService: any;
    let jwtService: any;
    let cacheManager: any;
    let emailService: any;
    let ulidService: any;

    beforeEach(async () => {
        const mockUsersService = {
            findOneByEmail: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        };
        const mockJwtService = {
            sign: jest.fn(),
        };
        const mockCacheManager = {
            set: jest.fn(),
            get: jest.fn(),
            del: jest.fn(),
        };
        const mockEmailService = {
            sendVerificationEmail: jest.fn(),
        };
        const mockUlidService = {
            generate: jest.fn().mockReturnValue('MOCK_TOKEN'),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: UsersService, useValue: mockUsersService },
                { provide: JwtService, useValue: mockJwtService },
                { provide: CACHE_MANAGER, useValue: mockCacheManager },
                { provide: EmailService, useValue: mockEmailService },
                { provide: UlidService, useValue: mockUlidService },
                { provide: ConfigService, useValue: { get: jest.fn() } },
                {
                    provide: getRepositoryToken(Passkey),
                    useValue: {
                        findOne: jest.fn(),
                        save: jest.fn(),
                        create: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        usersService = module.get<UsersService>(UsersService);
        jwtService = module.get<JwtService>(JwtService);
        cacheManager = module.get(CACHE_MANAGER);
        emailService = module.get(EmailService);
        ulidService = module.get(UlidService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('register', () => {
        it('should create a new inactive user and send verification email', async () => {
            const registerDto = { email: 'new@example.com' };
            const createdUser = { id: '01ARZ3NDEKTSV4RRFFQ69G5FAV', ...registerDto, isActive: false };

            usersService.findOneByEmail.mockResolvedValue(null);
            usersService.create.mockResolvedValue(createdUser);

            const result = await service.register(registerDto);

            expect(result).toEqual({ id: '01ARZ3NDEKTSV4RRFFQ69G5FAV', email: 'new@example.com', isActive: false });
            expect(usersService.create).toHaveBeenCalledWith(registerDto);
            expect(cacheManager.set).toHaveBeenCalledWith('verify_email:MOCK_TOKEN', registerDto.email, 3600 * 1000);
            expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(registerDto.email, 'MOCK_TOKEN');
        });

        it('should throw ConflictException if email already exists and is active', async () => {
            const registerDto = { email: 'existing@example.com' };
            usersService.findOneByEmail.mockResolvedValue({ id: '1', email: 'existing@example.com', isActive: true });

            await expect(service.register(registerDto)).rejects.toThrow('Email already registered');
        });

        it('should allow re-registering if account is exist but inactive', async () => {
            const registerDto = { email: 'inactive@example.com' };
            const existingUser = { id: '1', email: 'inactive@example.com', isActive: false };
            const updatedUser = { ...existingUser };

            usersService.findOneByEmail.mockResolvedValue(existingUser);
            usersService.update.mockResolvedValue(updatedUser);

            const result = await service.register(registerDto);

            expect(result).toBeDefined();
            expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(registerDto.email, 'MOCK_TOKEN');
        });
    });

    describe('verifyEmail', () => {
        it('should activate user and delete token if valid', async () => {
            const token = 'valid_token';
            const email = 'test@example.com';
            const user = { id: '1', email, isActive: false };

            cacheManager.get.mockResolvedValue(email);
            usersService.findOneByEmail.mockResolvedValue(user);

            await service.verifyEmail(token);

            expect(usersService.update).toHaveBeenCalledWith(user.id, { isActive: true });
            expect(cacheManager.del).toHaveBeenCalledWith(`verify_email:${token}`);
        });

        it('should throw BadRequestException if token is invalid', async () => {
            cacheManager.get.mockResolvedValue(null);
            await expect(service.verifyEmail('invalid')).rejects.toThrow('Invalid or expired verification token');
        });
    });


    describe('login', () => {
        it('should return an access token', async () => {
            const user = { id: 1, email: 'test@example.com' };
            const token = 'signed_jwt_token';

            jwtService.sign.mockReturnValue(token);

            const result = await service.login(user as any);
            expect(result).toEqual({ access_token: token });
            expect(jwtService.sign).toHaveBeenCalledWith({ email: user.email, sub: user.id });
        });
    });
});
