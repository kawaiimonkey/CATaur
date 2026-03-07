import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { JobOrder } from '../database/entities/job-order.entity';
import { Application } from '../database/entities/application.entity';
import { User } from '../database/entities/user.entity';
import { Company } from '../database/entities/company.entity';

describe('DashboardService', () => {
    let service: DashboardService;
    let jobOrderRepo: any;
    let applicationRepo: any;
    let userRepo: any;
    let companyRepo: any;

    function makeQb(countResult = 0, manyResult: any[] = []) {
        const qb: any = {
            leftJoin: jest.fn().mockReturnThis(),
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            getCount: jest.fn().mockResolvedValue(countResult),
            getMany: jest.fn().mockResolvedValue(manyResult),
        };
        return qb;
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DashboardService,
                {
                    provide: getRepositoryToken(JobOrder),
                    useValue: {
                        count: jest.fn().mockResolvedValue(0),
                        createQueryBuilder: jest.fn(() => makeQb()),
                    },
                },
                {
                    provide: getRepositoryToken(Application),
                    useValue: {
                        count: jest.fn().mockResolvedValue(0),
                        find: jest.fn().mockResolvedValue([]),
                        createQueryBuilder: jest.fn(() => makeQb()),
                    },
                },
                {
                    provide: getRepositoryToken(User),
                    useValue: { count: jest.fn().mockResolvedValue(0) },
                },
                {
                    provide: getRepositoryToken(Company),
                    useValue: { count: jest.fn().mockResolvedValue(0) },
                },
            ],
        }).compile();

        service = module.get<DashboardService>(DashboardService);
        jobOrderRepo = module.get(getRepositoryToken(JobOrder));
        applicationRepo = module.get(getRepositoryToken(Application));
        userRepo = module.get(getRepositoryToken(User));
        companyRepo = module.get(getRepositoryToken(Company));
    });

    afterEach(() => jest.clearAllMocks());

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    // ── getAdminDashboard ─────────────────────────────────────────────────
    describe('getAdminDashboard', () => {
        it('returns all admin KPI fields', async () => {
            userRepo.count.mockResolvedValue(50);
            companyRepo.count.mockResolvedValue(10);
            jobOrderRepo.count.mockResolvedValue(20);
            applicationRepo.count.mockResolvedValue(100);
            applicationRepo.find.mockResolvedValue([]);

            const result = await service.getAdminDashboard();

            expect(result).toMatchObject({
                totalUsers: 50,
                totalCompanies: 10,
                totalJobOrders: 20,
                totalApplications: 100,
                recentApplications: [],
            });
            expect(result).toHaveProperty('openJobOrders');
            expect(result).toHaveProperty('pendingDecisions');
        });
    });

    // ── getRecruiterDashboard ─────────────────────────────────────────────
    describe('getRecruiterDashboard', () => {
        it('returns recruiter-scoped KPI fields', async () => {
            jobOrderRepo.count.mockResolvedValue(7);
            // All QueryBuilder calls return scoped counts
            applicationRepo.createQueryBuilder.mockReturnValue(makeQb(15, []));

            const result = await service.getRecruiterDashboard('rec-1');

            expect(result).toHaveProperty('myJobOrders', 7);
            expect(result).toHaveProperty('myApplications');
            expect(result).toHaveProperty('pendingInterviews');
            expect(result).toHaveProperty('awaitingDecision');
            expect(result).toHaveProperty('recentApplications');
        });
    });

    // ── getClientDashboard ────────────────────────────────────────────────
    describe('getClientDashboard', () => {
        it('returns zeros and empty array when no companyIds given', async () => {
            const result = await service.getClientDashboard([]);

            expect(result).toEqual({
                activeOrders: 0,
                candidatesInReview: 0,
                pendingDecisions: 0,
                recentCandidates: [],
            });
        });

        it('returns client-scoped KPI fields when companyIds provided', async () => {
            jobOrderRepo.createQueryBuilder.mockReturnValue(makeQb(4));
            applicationRepo.createQueryBuilder.mockReturnValue(makeQb(12, []));

            const result = await service.getClientDashboard(['co-1']);

            expect(result).toHaveProperty('activeOrders');
            expect(result).toHaveProperty('candidatesInReview');
            expect(result).toHaveProperty('pendingDecisions');
            expect(result).toHaveProperty('recentCandidates');
        });
    });
});
