import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
    let service: AuthService;
    let usersService: any;
    let jwtService: any;

    beforeEach(async () => {
        const mockUsersService = {
            findOneByEmail: jest.fn(),
        };
        const mockJwtService = {
            sign: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: UsersService, useValue: mockUsersService },
                { provide: JwtService, useValue: mockJwtService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        usersService = module.get<UsersService>(UsersService);
        jwtService = module.get<JwtService>(JwtService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('validateUser', () => {
        it('should return user without password if credentials are valid', async () => {
            const user = { id: 1, email: 'test@example.com', password: 'hashed_password' };
            const pass = 'password123';

            usersService.findOneByEmail.mockResolvedValue(user);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await service.validateUser(user.email, pass);
            expect(result).toEqual({ id: 1, email: 'test@example.com' });
        });

        it('should return null if password does not match', async () => {
            const user = { id: 1, email: 'test@example.com', password: 'hashed_password' };
            const pass = 'wrong_password';

            usersService.findOneByEmail.mockResolvedValue(user);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            const result = await service.validateUser(user.email, pass);
            expect(result).toBeNull();
        });

        it('should return null if user not found', async () => {
            usersService.findOneByEmail.mockResolvedValue(null);

            const result = await service.validateUser('none@example.com', 'password');
            expect(result).toBeNull();
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
