import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { Application } from '../database/entities/application.entity';
import { JobOrder } from '../database/entities/job-order.entity';
import { User } from '../database/entities/user.entity';
import { UlidService } from '../common/ulid.service';
import { EmailService } from '../common/email.service';
import { NotificationsService } from '../notifications/notifications.service';

const ULID = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

describe('ApplicationsService', () => {
    let service: ApplicationsService;
    let repo: any;
    let jobOrderRepo: any;
    let userRepo: any;
    let emailService: any;
    let notificationsService: any;

    const mockRepo = () => ({
        createQueryBuilder: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        remove: jest.fn(),
    });

    const mockEmailService = {
        sendInterviewInvitation: jest.fn().mockResolvedValue(undefined),
        sendOfferNotification: jest.fn().mockResolvedValue(undefined),
    };

    const mockNotificationsService = {
        create: jest.fn().mockResolvedValue(undefined),
    };

    const mockUlid = { generate: jest.fn().mockReturnValue(ULID) };

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
                ApplicationsService,
                { provide: getRepositoryToken(Application), useFactory: mockRepo },
                { provide: getRepositoryToken(JobOrder), useFactory: mockRepo },
                { provide: getRepositoryToken(User), useFactory: mockRepo },
                { provide: UlidService, useValue: mockUlid },
                { provide: EmailService, useValue: mockEmailService },
                { provide: NotificationsService, useValue: mockNotificationsService },
            ],
        }).compile();

        service = module.get<ApplicationsService>(ApplicationsService);
        repo = module.get(getRepositoryToken(Application));
        jobOrderRepo = module.get(getRepositoryToken(JobOrder));
        userRepo = module.get(getRepositoryToken(User));
    });

    afterEach(() => jest.clearAllMocks());

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    // ── findAll ────────────────────────────────────────────────────────────
    describe('findAll', () => {
        it('returns paginated results with no scope', async () => {
            const items = [{ id: ULID, status: 'new' }];
            repo.createQueryBuilder.mockReturnValue(makeQb(items));

            const result = await service.findAll({});

            expect(result.data).toEqual(items);
            expect(result.total).toBe(1);
        });

        it('applies recruiter scope (assignedToId)', async () => {
            const qb = makeQb([]);
            repo.createQueryBuilder.mockReturnValue(qb);

            await service.findAll({ assignedToId: 'rec-1' });

            expect(qb.andWhere).toHaveBeenCalledWith(
                'jobOrder.assignedToId = :rid',
                { rid: 'rec-1' },
            );
        });

        it('applies client scope (companyIds)', async () => {
            const qb = makeQb([]);
            repo.createQueryBuilder.mockReturnValue(qb);

            await service.findAll({ companyIds: ['co-1', 'co-2'] });

            expect(qb.andWhere).toHaveBeenCalledWith(
                'jobOrder.companyId IN (:...cids)',
                { cids: ['co-1', 'co-2'] },
            );
        });
    });

    // ── findOne ────────────────────────────────────────────────────────────
    describe('findOne', () => {
        it('returns the application when found', async () => {
            const app = { id: ULID, status: 'new', jobOrder: { assignedToId: 'rec-1', companyId: 'co-1' } };
            repo.findOne.mockResolvedValue(app);

            const result = await service.findOne(ULID);

            expect(result).toEqual(app);
        });

        it('throws NotFoundException when not found', async () => {
            repo.findOne.mockResolvedValue(null);
            await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
        });

        it('throws 404 when recruiter scope does not match', async () => {
            const app = { id: ULID, jobOrder: { assignedToId: 'other-rec', companyId: 'co-1' } };
            repo.findOne.mockResolvedValue(app);

            await expect(service.findOne(ULID, { assignedToId: 'my-rec-id' }))
                .rejects.toThrow(NotFoundException);
        });
    });

    // ── create ────────────────────────────────────────────────────────────
    describe('create', () => {
        it('creates an application with recruiter_import source', async () => {
            const dto = { jobOrderId: 'jo-1', candidateId: 'cand-1' };
            const created = { id: ULID, ...dto, status: 'new', source: 'recruiter_import' };
            repo.create.mockReturnValue(created);
            repo.save.mockResolvedValue(created);
            repo.findOne.mockResolvedValue({ ...created, jobOrder: {}, candidate: {} });

            const result = await service.create(dto, 'recruiter_import');

            expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({
                id: ULID,
                jobOrderId: 'jo-1',
                candidateId: 'cand-1',
                status: 'new',
                source: 'recruiter_import',
            }));
            expect(result).toBeDefined();
        });
    });

    // ── updateStatus ──────────────────────────────────────────────────────
    describe('updateStatus', () => {
        const baseApp = {
            id: ULID,
            status: 'new',
            jobOrder: { id: 'jo-1', title: 'Dev', assignedToId: 'rec-1', companyId: 'co-1', company: { clientId: 'client-1' } },
            candidate: { id: 'cand-1', email: 'cand@test.com', nickname: 'Alice' },
        };

        it('throws BadRequestException when moving to interview without date/content', async () => {
            repo.findOne.mockResolvedValue({ ...baseApp });

            await expect(
                service.updateStatus(ULID, { status: 'interview' } as any),
            ).rejects.toThrow(BadRequestException);
        });

        it('sends interview email when status → interview', async () => {
            repo.findOne.mockResolvedValue({ ...baseApp });
            repo.save.mockResolvedValue({ ...baseApp, status: 'interview' });

            await service.updateStatus(ULID, {
                status: 'interview',
                interviewDate: '2026-03-20',
                interviewContent: 'Zoom call at 10am',
            });

            expect(mockEmailService.sendInterviewInvitation).toHaveBeenCalledWith(
                'cand@test.com',
                expect.any(String),
                'Zoom call at 10am',
            );
        });

        it('creates a notification when status → offer', async () => {
            repo.findOne.mockResolvedValue({ ...baseApp, status: 'interview' });
            jobOrderRepo.findOne.mockResolvedValue(baseApp.jobOrder);
            repo.save.mockResolvedValue({ ...baseApp, status: 'offer' });

            await service.updateStatus(ULID, { status: 'offer' } as any);

            expect(mockNotificationsService.create).toHaveBeenCalledWith(
                'client-1',
                'offer_extended',
                'Offer Extended',
                expect.stringContaining('Alice'),
                ULID,
            );
        });
    });

    // ── submitDecision ────────────────────────────────────────────────────
    describe('submitDecision', () => {
        it('saves the decision and notifies the recruiter', async () => {
            const app = {
                id: ULID,
                jobOrder: { assignedToId: 'rec-1', companyId: 'co-1' },
                candidate: { nickname: 'Alice' },
                clientDecisionType: null,
            };
            repo.findOne.mockResolvedValue(app);
            repo.save.mockResolvedValue({ ...app, clientDecisionType: 'pass' });

            await service.submitDecision(ULID, { type: 'pass', note: 'Not a fit' }, ['co-1']);

            expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({
                clientDecisionType: 'pass',
                clientDecisionNote: 'Not a fit',
            }));
            expect(mockNotificationsService.create).toHaveBeenCalledWith(
                'rec-1',
                'client_decision',
                'Client Decision Received',
                expect.stringContaining('pass'),
                ULID,
            );
        });
    });

    // ── delete ────────────────────────────────────────────────────────────
    describe('delete', () => {
        it('removes the application', async () => {
            const app = { id: ULID };
            repo.findOne.mockResolvedValue(app);
            repo.remove.mockResolvedValue(app);

            await service.delete(ULID);

            expect(repo.remove).toHaveBeenCalledWith(app);
        });

        it('throws NotFoundException when not found', async () => {
            repo.findOne.mockResolvedValue(null);
            await expect(service.delete('bad-id')).rejects.toThrow(NotFoundException);
        });
    });
});
