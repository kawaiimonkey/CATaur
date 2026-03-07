import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { JobOrdersService } from './job-orders.service';
import { JobOrder } from '../database/entities/job-order.entity';
import { UlidService } from '../common/ulid.service';

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

            const result = await service.findAll({});

            expect(result.data).toEqual(items);
            expect(result.total).toBe(1);
            expect(result.totalPages).toBe(1);
        });

        it('applies assignedToId scope', async () => {
            const qb = makeQb([]);
            repo.createQueryBuilder.mockReturnValue(qb);

            await service.findAll({ assignedToId: 'rec-1' });

            expect(qb.andWhere).toHaveBeenCalledWith(
                'jo.assignedToId = :assignedToId',
                { assignedToId: 'rec-1' },
            );
        });

        it('applies status filter', async () => {
            const qb = makeQb([]);
            repo.createQueryBuilder.mockReturnValue(qb);

            await service.findAll({}, { status: 'sourcing' });

            expect(qb.andWhere).toHaveBeenCalledWith('jo.status = :status', { status: 'sourcing' });
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

            const result = await service.create(dto, 'rec-1');

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
