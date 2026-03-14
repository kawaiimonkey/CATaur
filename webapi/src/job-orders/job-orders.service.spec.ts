import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { JobOrdersService } from './job-orders.service';
import { JobOrder } from '../database/entities/job-order.entity';
import { UlidService } from '../common/ulid.service';
import { EncryptionService } from '../common/encryption.service';

const ULID = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

describe('JobOrdersService', () => {
    let service: JobOrdersService;
    let repo: any;

    const mockRepo = () => ({
        createQueryBuilder: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        remove: jest.fn(),
    });

    const mockUlid = { generate: jest.fn().mockReturnValue(ULID) };

    const mockEncryptionService = {
        encryptText: jest.fn((v: string) => Buffer.from(v, 'utf8')),
        decryptText: jest.fn((b: Buffer) => b.toString('utf8')),
    };

    /** Builds a chainable QueryBuilder mock that resolves to [data, total] */
    function makeQb(data: any[], total = data.length) {
        const qb: any = {
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            getManyAndCount: jest.fn().mockResolvedValue([data, total]),
        };
        return qb;
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JobOrdersService,
                { provide: getRepositoryToken(JobOrder), useFactory: mockRepo },
                { provide: UlidService, useValue: mockUlid },
                { provide: EncryptionService, useValue: mockEncryptionService },
            ],
        }).compile();

        service = module.get<JobOrdersService>(JobOrdersService);
        repo = module.get(getRepositoryToken(JobOrder));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    // ── findAll ────────────────────────────────────────────────────────────
    describe('findAll', () => {
        it('returns paginated results with no scope', async () => {
            const items = [{ id: ULID, title: 'Dev Role' }];
            repo.createQueryBuilder.mockReturnValue(makeQb(items));

            const result = await service.findAll({} as any);

            expect(result.data).toEqual(items);
            expect(result.total).toBe(1);
            expect(result.totalPages).toBe(1);
        });

        it('applies assignedToId scope', async () => {
            const qb = makeQb([]);
            repo.createQueryBuilder.mockReturnValue(qb);

            await service.findAll({ assignedToId: 'rec-1' } as any);

            expect(qb.andWhere).toHaveBeenCalledWith(
                'jo.assignedToId = :assignedToId',
                { assignedToId: 'rec-1' },
            );
        });

        it('applies status filter', async () => {
            const qb = makeQb([]);
            repo.createQueryBuilder.mockReturnValue(qb);

            await service.findAll({} as any, { status: 'sourcing' });

            expect(qb.andWhere).toHaveBeenCalledWith('jo.status = :status', { status: 'sourcing' });
        });

        it('applies statuses filter', async () => {
            const qb = makeQb([]);
            repo.createQueryBuilder.mockReturnValue(qb);

            await service.findAll({} as any, { statuses: ['sourcing', 'interview'] });

            expect(qb.andWhere).toHaveBeenCalledWith('jo.status IN (:...statuses)', {
                statuses: ['sourcing', 'interview'],
            });
        });

        it('applies search filter for title or id (trimmed)', async () => {
            const qb = makeQb([]);
            repo.createQueryBuilder.mockReturnValue(qb);

            await service.findAll({} as any, { search: '  Dev  ' });

            expect(qb.andWhere).toHaveBeenCalledWith(
                '(jo.title LIKE :search OR jo.id LIKE :search)',
                { search: '%Dev%' },
            );
        });

        it('does not apply search filter when search is blank', async () => {
            const qb = makeQb([]);
            repo.createQueryBuilder.mockReturnValue(qb);

            await service.findAll({} as any, { search: '   ' });

            expect(qb.andWhere).not.toHaveBeenCalledWith(
                '(jo.title LIKE :search OR jo.id LIKE :search)',
                expect.anything(),
            );
        });

        it('applies companyIds scope', async () => {
            const qb = makeQb([]);
            repo.createQueryBuilder.mockReturnValue(qb);

            await service.findAll({ companyIds: ['co-1', 'co-2'] } as any);

            expect(qb.andWhere).toHaveBeenCalledWith('jo.companyId IN (:...companyIds)', {
                companyIds: ['co-1', 'co-2'],
            });
        });

        it('applies employmentType filter', async () => {
            const qb = makeQb([]);
            repo.createQueryBuilder.mockReturnValue(qb);

            await service.findAll({} as any, { employmentTypes: ['Full-time'] });

            expect(qb.andWhere).toHaveBeenCalledWith('jo.employmentType IN (:...employmentTypes)', {
                employmentTypes: ['Full-time'],
            });
        });

        it('applies workArrangement filter', async () => {
            const qb = makeQb([]);
            repo.createQueryBuilder.mockReturnValue(qb);

            await service.findAll({} as any, { workArrangements: ['Remote'] });

            expect(qb.andWhere).toHaveBeenCalledWith('jo.workArrangement IN (:...workArrangements)', {
                workArrangements: ['Remote'],
            });
        });

        it('applies location filters', async () => {
            const qb = makeQb([]);
            repo.createQueryBuilder.mockReturnValue(qb);

            await service.findAll({} as any, {
                locationCountry: 'CA',
                locationState: 'ON',
                locationCity: 'Toronto',
            });

            expect(qb.andWhere).toHaveBeenCalledWith('jo.locationCountry = :locationCountry', { locationCountry: 'CA' });
            expect(qb.andWhere).toHaveBeenCalledWith('jo.locationState = :locationState', { locationState: 'ON' });
            expect(qb.andWhere).toHaveBeenCalledWith('jo.locationCity = :locationCity', { locationCity: 'Toronto' });
        });

        it('orders by openings when sortBy=openings', async () => {
            const qb = makeQb([]);
            repo.createQueryBuilder.mockReturnValue(qb);

            await service.findAll({} as any, { sortBy: 'openings' });

            expect(qb.orderBy).toHaveBeenCalledWith('jo.openings', 'DESC');
        });

        it('orders by createdAt when sortBy is omitted', async () => {
            const qb = makeQb([]);
            repo.createQueryBuilder.mockReturnValue(qb);

            await service.findAll({} as any);

            expect(qb.orderBy).toHaveBeenCalledWith('jo.createdAt', 'DESC');
        });
    });

    // ── findOne ────────────────────────────────────────────────────────────
    describe('findOne', () => {
        it('returns the job order when found', async () => {
            const jo = { id: ULID, title: 'Dev Role' };
            repo.findOne.mockResolvedValue(jo);

            const result = await service.findOne(ULID);

            expect(result).toEqual(jo);
            expect(repo.findOne).toHaveBeenCalledWith({
                where: { id: ULID },
                relations: ['company', 'assignedTo'],
            });
        });

        it('throws NotFoundException when not found', async () => {
            repo.findOne.mockResolvedValue(null);
            await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
        });
    });

    // ── create ────────────────────────────────────────────────────────────
    describe('create', () => {
        it('creates a job order assigned to the given recruiter', async () => {
            const dto = { title: 'New Role' };
            const created = { id: ULID, title: 'New Role', assignedToId: 'rec-1' };
            repo.create.mockReturnValue(created);
            repo.save.mockResolvedValue(created);
            repo.findOne.mockResolvedValue(created); // for internal findOne call

            const result = await service.create(dto as any, 'rec-1');

            expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({
                id: ULID,
                title: 'New Role',
                assignedToId: 'rec-1',
                status: 'sourcing',
            }));
            expect(result).toEqual(created);
        });
    });

    // ── updateStatus ──────────────────────────────────────────────────────
    describe('updateStatus', () => {
        it('updates the status field and saves', async () => {
            const jo = { id: ULID, title: 'Role', status: 'sourcing' };
            repo.findOne.mockResolvedValue(jo);
            repo.save.mockResolvedValue({ ...jo, status: 'filled' });

            const result = await service.updateStatus(ULID, 'filled');

            expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ status: 'filled' }));
            expect(result.status).toBe('filled');
        });
    });

    // ── delete ────────────────────────────────────────────────────────────
    describe('delete', () => {
        it('removes the job order', async () => {
            const jo = { id: ULID };
            repo.findOne.mockResolvedValue(jo);
            repo.remove.mockResolvedValue(jo);

            await service.delete(ULID);

            expect(repo.remove).toHaveBeenCalledWith(jo);
        });

        it('throws NotFoundException when not found', async () => {
            repo.findOne.mockResolvedValue(null);
            await expect(service.delete('bad-id')).rejects.toThrow(NotFoundException);
        });
    });
});
