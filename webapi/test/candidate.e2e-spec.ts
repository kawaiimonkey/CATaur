import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { User } from '../src/database/entities/user.entity';
import { UserRole, Role } from '../src/database/entities/user-role.entity';
import { Company } from '../src/database/entities/company.entity';
import { JobOrder } from '../src/database/entities/job-order.entity';
import { Application } from '../src/database/entities/application.entity';
import { AuditLog } from '../src/database/entities/audit-log.entity';
import { Notification } from '../src/database/entities/notification.entity';
import { Passkey } from '../src/database/entities/passkey.entity';
import * as bcrypt from 'bcrypt';
import { UlidService } from '../src/common/ulid.service';
import { EmailService } from '../src/common/email.service';
import { CaptchaService } from '../src/auth/captcha.service';

describe('Candidate APIs (e2e)', () => {
    let app: INestApplication;
    let dataSource: DataSource;
    let ulidService: UlidService;

    let candidateToken: string;
    let recruiterToken: string;

    let candidateId: string;
    let otherCandidateId: string;
    let recruiterId: string;
    let clientId: string;

    let companyId: string;

    let jobSourcingId: string;
    let jobInterviewId: string;
    let jobPausedId: string;
    let jobFilledId: string;
    let jobOfferId: string;

    beforeAll(async () => {
        const mockEmailService = {
            sendVerificationEmail: jest.fn().mockResolvedValue(true),
            sendVerificationCodeEmail: jest.fn().mockResolvedValue(true),
            sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
            sendPasswordChangedNotification: jest.fn().mockResolvedValue(true),
            sendInterviewInvitation: jest.fn().mockResolvedValue(true),
            sendOfferNotification: jest.fn().mockResolvedValue(true),
        };

        const mockCaptchaService = {
            verifyToken: jest.fn().mockResolvedValue(true),
        };

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(EmailService)
            .useValue(mockEmailService)
            .overrideProvider(CaptchaService)
            .useValue(mockCaptchaService)
            .compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
        await app.init();

        dataSource = app.get(getDataSourceToken());
        ulidService = app.get(UlidService);

        await cleanup();
        await seedData();
    });

    afterAll(async () => {
        await cleanup();
        await app.close();
    });

    async function cleanup() {
        await dataSource.createQueryBuilder().delete().from(Notification).execute();
        await dataSource.createQueryBuilder().delete().from(AuditLog).execute();
        await dataSource.createQueryBuilder().delete().from(Application).execute();
        await dataSource.createQueryBuilder().delete().from(JobOrder).execute();
        await dataSource.createQueryBuilder().delete().from(Company).execute();
        await dataSource.createQueryBuilder().delete().from(Passkey).execute();
        await dataSource.createQueryBuilder().delete().from(UserRole).execute();
        await dataSource.createQueryBuilder().delete().from(User).execute();
    }

    async function seedData() {
        const passwordHash = await bcrypt.hash('Pass123!@#', 12);

        candidateId = ulidService.generate();
        otherCandidateId = ulidService.generate();
        recruiterId = ulidService.generate();
        clientId = ulidService.generate();

        await dataSource.getRepository(User).insert([
            {
                id: candidateId,
                email: 'candidate.e2e@test.com',
                nickname: 'Candidate E2E',
                passwordHash,
                isActive: true,
            },
            {
                id: otherCandidateId,
                email: 'candidate.other.e2e@test.com',
                nickname: 'Other Candidate E2E',
                passwordHash,
                isActive: true,
            },
            {
                id: recruiterId,
                email: 'recruiter.candidate.e2e@test.com',
                nickname: 'Recruiter Candidate E2E',
                passwordHash,
                isActive: true,
            },
            {
                id: clientId,
                email: 'client.candidate.e2e@test.com',
                nickname: 'Client Candidate E2E',
                passwordHash,
                isActive: true,
            },
        ]);

        await dataSource.getRepository(UserRole).insert([
            { userId: candidateId, role: Role.CANDIDATE },
            { userId: otherCandidateId, role: Role.CANDIDATE },
            { userId: recruiterId, role: Role.RECRUITER },
            { userId: clientId, role: Role.CLIENT },
        ]);

        companyId = ulidService.generate();
        await dataSource.getRepository(Company).insert({
            id: companyId,
            name: 'Candidate E2E Company',
            email: 'candidate-company@test.com',
            clientId,
            location: 'Calgary',
        });

        jobSourcingId = ulidService.generate();
        jobInterviewId = ulidService.generate();
        jobPausedId = ulidService.generate();
        jobFilledId = ulidService.generate();
        jobOfferId = ulidService.generate();

        await dataSource.getRepository(JobOrder).insert([
            {
                id: jobSourcingId,
                title: 'Sourcing Role',
                description: 'Open role 1',
                status: 'sourcing',
                priority: 'high',
                openings: 1,
                companyId,
                assignedToId: recruiterId,
            },
            {
                id: jobInterviewId,
                title: 'Interview Role',
                description: 'Open role 2',
                status: 'interview',
                priority: 'medium',
                openings: 1,
                companyId,
                assignedToId: recruiterId,
            },
            {
                id: jobPausedId,
                title: 'Paused Role',
                description: 'Closed role 1',
                status: 'paused',
                priority: 'low',
                openings: 1,
                companyId,
                assignedToId: recruiterId,
            },
            {
                id: jobFilledId,
                title: 'Filled Role',
                description: 'Closed role 2',
                status: 'filled',
                priority: 'low',
                openings: 1,
                companyId,
                assignedToId: recruiterId,
            },
            {
                id: jobOfferId,
                title: 'Offer Role',
                description: 'Closed role 3',
                status: 'offer',
                priority: 'low',
                openings: 1,
                companyId,
                assignedToId: recruiterId,
            },
        ]);

        const app1Id = ulidService.generate();
        const app2Id = ulidService.generate();
        const app3Id = ulidService.generate();

        await dataSource.getRepository(Application).insert([
            {
                id: app1Id,
                jobOrderId: jobSourcingId,
                candidateId,
                status: 'new',
                source: 'self_applied',
                location: 'Calgary',
            },
            {
                id: app2Id,
                jobOrderId: jobInterviewId,
                candidateId,
                status: 'interview',
                source: 'self_applied',
                location: 'Edmonton',
            },
            {
                id: app3Id,
                jobOrderId: jobSourcingId,
                candidateId: otherCandidateId,
                status: 'new',
                source: 'self_applied',
                location: 'Vancouver',
            },
        ]);

        const candidateLogin = await request(app.getHttpServer())
            .post('/auth/login/password')
            .send({ email: 'candidate.e2e@test.com', password: 'Pass123!@#' });
        candidateToken = candidateLogin.body.access_token;

        const recruiterLogin = await request(app.getHttpServer())
            .post('/auth/login/password')
            .send({ email: 'recruiter.candidate.e2e@test.com', password: 'Pass123!@#' });
        recruiterToken = recruiterLogin.body.access_token;
    }

    describe('RBAC', () => {
        it('GET /candidate/jobs returns 401 when unauthenticated', async () => {
            const res = await request(app.getHttpServer()).get('/candidate/jobs');
            expect(res.status).toBe(401);
        });

        it('GET /candidate/jobs returns 403 for wrong role', async () => {
            const res = await request(app.getHttpServer())
                .get('/candidate/jobs')
                .set('Authorization', `Bearer ${recruiterToken}`);
            expect(res.status).toBe(403);
        });
    });

    describe('GET /candidate/jobs', () => {
        it('returns only sourcing/interview jobs', async () => {
            const res = await request(app.getHttpServer())
                .get('/candidate/jobs?page=1&limit=20')
                .set('Authorization', `Bearer ${candidateToken}`);

            expect(res.status).toBe(200);
            const statuses = res.body.data.map((job: any) => job.status);
            expect(statuses.every((s: string) => ['sourcing', 'interview'].includes(s))).toBe(true);

            const ids = res.body.data.map((job: any) => job.id);
            expect(ids).toContain(jobSourcingId);
            expect(ids).toContain(jobInterviewId);
            expect(ids).not.toContain(jobPausedId);
            expect(ids).not.toContain(jobFilledId);
            expect(ids).not.toContain(jobOfferId);
        });
    });

    describe('GET /candidate/applications', () => {
        it('returns only self applications and correct pagination metadata', async () => {
            const page1 = await request(app.getHttpServer())
                .get('/candidate/applications?page=1&limit=1')
                .set('Authorization', `Bearer ${candidateToken}`);

            expect(page1.status).toBe(200);
            expect(page1.body.total).toBe(2);
            expect(page1.body.page).toBe(1);
            expect(page1.body.limit).toBe(1);
            expect(page1.body.totalPages).toBe(2);
            expect(page1.body.data).toHaveLength(1);
            expect(page1.body.data[0].candidateId).toBe(candidateId);

            const page2 = await request(app.getHttpServer())
                .get('/candidate/applications?page=2&limit=1')
                .set('Authorization', `Bearer ${candidateToken}`);

            expect(page2.status).toBe(200);
            expect(page2.body.total).toBe(2);
            expect(page2.body.page).toBe(2);
            expect(page2.body.limit).toBe(1);
            expect(page2.body.totalPages).toBe(2);
            expect(page2.body.data).toHaveLength(1);
            expect(page2.body.data[0].candidateId).toBe(candidateId);

            const returnedIds = [...page1.body.data, ...page2.body.data].map((a: any) => a.candidateId);
            expect(returnedIds.every((id: string) => id === candidateId)).toBe(true);
        });
    });
});
