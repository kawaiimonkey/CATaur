import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { UlidService } from '../common/ulid.service';



describe('UsersService', () => {
    let service: UsersService;
    let repository: any;
    let ulidService: UlidService;

    beforeEach(async () => {
        const mockRepository = {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
        };

        const mockUlidService = {
            generate: jest.fn().mockReturnValue('01ARZ3NDEKTSV4RRFFQ69G5FAV'),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                { provide: getRepositoryToken(User), useValue: mockRepository },
                { provide: UlidService, useValue: mockUlidService },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        repository = module.get(getRepositoryToken(User));
        ulidService = module.get<UlidService>(UlidService);
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
        it('should save user', async () => {
            const userData = { email: 'test@example.com' };
            const generatedId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
            const createdUser = { id: generatedId, ...userData };

            repository.create.mockReturnValue(createdUser);
            repository.save.mockResolvedValue(createdUser);

            const result = await service.create(userData);

            expect(result).toEqual(createdUser);
            expect(repository.create).toHaveBeenCalledWith({
                id: generatedId,
                ...userData,
            });
            expect(repository.save).toHaveBeenCalledWith(createdUser);
        });
    });

    describe('update', () => {
        it('should update user and return updated user', async () => {
            const id = 'user_id';
            const updateData = { isActive: true };
            const updatedUser = { id, email: 'test@example.com', ...updateData };

            repository.update = jest.fn().mockResolvedValue({ affected: 1 });
            repository.findOne.mockResolvedValue(updatedUser);

            const result = await service.update(id, updateData);

            expect(result).toEqual(updatedUser);
            expect(repository.update).toHaveBeenCalledWith(id, updateData);
            expect(repository.findOne).toHaveBeenCalledWith({ where: { id } });
        });
    });
});
