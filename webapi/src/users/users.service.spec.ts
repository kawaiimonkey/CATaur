import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
    let service: UsersService;
    let repository: any;

    beforeEach(async () => {
        const mockRepository = {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                { provide: getRepositoryToken(User), useValue: mockRepository },
                { provide: CACHE_MANAGER, useValue: {} }, // Not used anymore but kept in case of future changes
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        repository = module.get(getRepositoryToken(User));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findOneByEmail', () => {
        it('should call repository.findOne with correct params', async () => {
            const email = 'test@example.com';
            repository.findOne.mockResolvedValue({ email } as User);

            const result = await service.findOneByEmail(email);

            expect(result).toBeDefined();
            expect(result!.email).toEqual(email);
            expect(repository.findOne).toHaveBeenCalledWith({ where: { email } });
        });
    });

    describe('create', () => {
        it('should hash password and save user', async () => {
            const userData = { email: 'test@example.com', password: 'password123' };
            const hashedPassword = 'hashed_password';
            const createdUser = { ...userData, password: hashedPassword };

            (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
            repository.create.mockReturnValue(createdUser);
            repository.save.mockResolvedValue(createdUser);

            const result = await service.create(userData);

            expect(result).toEqual(createdUser);
            expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
            expect(repository.create).toHaveBeenCalledWith({
                ...userData,
                password: hashedPassword,
            });
            expect(repository.save).toHaveBeenCalledWith(createdUser);
        });
    });
});
