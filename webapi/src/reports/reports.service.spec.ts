import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { JobOrder } from '../database/entities/job-order.entity';
import { Application } from '../database/entities/application.entity';

describe('ReportsService', () => {
    let service: ReportsService;
    let jobOrderRepo: any;
    let applicationRepo: any;

    function makeQb(rawResult: any[] = []) {
        const qb: any = {
            select: jest.fn().mockReturnThis(),
            addSelect: jest.fn().mockReturnThis(),
            leftJoin: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            groupBy: jest.fn().mockReturnThis(),
            addGroupBy: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            getRawMany: jest.fn().mockResolvedValue(rawResult),
            getMany: jest.fn().mockResolvedValue(rawResult),
        };
        return qb;
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReportsService,
                {
                    provide: getRepositoryToken(JobOrder),
                    useValue: { createQueryBuilder: jest.fn() },
                },
                {
                    provide: getRepositoryToken(Application),
                    useValue: { createQueryBuilder: jest.fn() },
                },
            ],
        }).compile();

        service = module.get<ReportsService>(ReportsService);
        jobOrderRepo = module.get(getRepositoryToken(JobOrder));
        applicationRepo = module.get(getRepositoryToken(Application));
    });

    afterEach(() => jest.clearAllMocks());

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    // ── getJobOrderStats ───────────────────────────────────────────────────
    describe('getJobOrderStats', () => {
        it('returns correct totals from raw DB rows', async () => {
            jobOrderRepo.createQueryBuilder.mockReturnValue(
                makeQb([
                    { status: 'sourcing', count: '10' },
                    { status: 'filled', count: '5' },
                ]),
            );

            const result = await service.getJobOrderStats();

            expect(result.total).toBe(15);
            expect(result.byStatus).toEqual({ sourcing: 10, filled: 5 });
        });

        it('applies recruiter scope', async () => {
            const qb = makeQb([]);
            jobOrderRepo.createQueryBuilder.mockReturnValue(qb);

            await service.getJobOrderStats({ assignedToId: 'rec-1' });

            expect(qb.where).toHaveBeenCalledWith(
                'jo.assignedToId = :rid',
                { rid: 'rec-1' },
            );
        });

        it('applies client companyIds scope', async () => {
            const qb = makeQb([]);
            jobOrderRepo.createQueryBuilder.mockReturnValue(qb);

            await service.getJobOrderStats({ companyIds: ['co-1'] });

            expect(qb.where).toHaveBeenCalledWith(
                'jo.companyId IN (:...cids)',
                { cids: ['co-1'] },
            );
        });
    });

    // ── getApplicationStats ────────────────────────────────────────────────
    describe('getApplicationStats', () => {
        it('returns counts grouped by status and source', async () => {
            applicationRepo.createQueryBuilder.mockReturnValue(
                makeQb([
                    { status: 'new', source: 'recruiter_import' },
                    { status: 'interview', source: 'self_applied' },
                    { status: 'new', source: 'self_applied' },
                ]),
            );

            const result = await service.getApplicationStats();

            expect(result.total).toBe(3);
            expect(result.byStatus).toEqual({ new: 2, interview: 1 });
            expect(result.bySource).toEqual({ recruiter_import: 1, self_applied: 2 });
        });
    });

    // ── getTopJobOrders ────────────────────────────────────────────────────
    describe('getTopJobOrders', () => {
        it('maps raw rows to TopJobOrder shape', async () => {
            applicationRepo.createQueryBuilder.mockReturnValue(
                makeQb([
                    { id: 'jo-1', title: 'Dev', status: 'sourcing', applicationCount: '8' },
                ]),
            );

            const result = await service.getTopJobOrders();

            expect(result).toHaveLength(1);
            expect(result[0].applicationCount).toBe(8);
        });
    });

    // ── getActivityTimeline ────────────────────────────────────────────────
    describe('getActivityTimeline', () => {
        it('merges job order and application daily rows', async () => {
            const joQb = makeQb([{ date: '2026-03-01', count: '3' }]);
            const appQb = makeQb([{ date: '2026-03-01', count: '7' }]);
            let call = 0;
            jobOrderRepo.createQueryBuilder.mockReturnValue(joQb);
            applicationRepo.createQueryBuilder.mockImplementation(() => {
                call++;
                return appQb;
            });

            const result = await service.getActivityTimeline();

            expect(result[0]).toMatchObject({ date: '2026-03-01', jobOrders: 3, applications: 7 });
        });
    });
});
