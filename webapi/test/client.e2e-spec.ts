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
import { EncryptionService } from '../src/common/encryption.service';

function encText(enc: EncryptionService, value: string | null | undefined): Buffer | null {
    if (value === null || value === undefined) {
        return null;
    }
    return enc.encryptText(value);
}

describe('Client APIs (e2e)', () => {
    let app: INestApplication;
    let dataSource: DataSource;
    let ulidService: UlidService;
    let encryptionService: EncryptionService;

    let clientToken: string;
    let recruiterToken: string;

    let clientId: string;
    let otherClientId: string;
    let recruiterId: string;

    let candidateAId: string;
    let candidateBId: string;
    let outsiderCandidateId: string;

    let companyAId: string;
    let companyBId: string;
    let outsiderCompanyId: string;

    let jobAId: string;
    let jobBId: string;
    let outsiderJobId: string;

    let appAId: string;
    let appBId: string;
    let outsiderAppId: string;

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
        encryptionService = app.get(EncryptionService);

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

        clientId = ulidService.generate();
        otherClientId = ulidService.generate();
        recruiterId = ulidService.generate();
        candidateAId = ulidService.generate();
        candidateBId = ulidService.generate();
        outsiderCandidateId = ulidService.generate();

        await dataSource.getRepository(User).insert([
            {
                id: clientId,
                email: 'client.e2e@test.com',
                nickname: 'Client E2E',
                passwordHash,
                isActive: true,
            },
            {
                id: otherClientId,
                email: 'client.other.e2e@test.com',
                nickname: 'Other Client E2E',
                passwordHash,
                isActive: true,
            },
            {
                id: recruiterId,
                email: 'recruiter.client.e2e@test.com',
                nickname: 'Recruiter Client E2E',
                passwordHash,
                isActive: true,
            },
            {
                id: candidateAId,
                email: 'candidate.a.client.e2e@test.com',
                nickname: 'Candidate A',
                passwordHash,
                isActive: true,
            },
            {
                id: candidateBId,
                email: 'candidate.b.client.e2e@test.com',
                nickname: 'Candidate B',
                passwordHash,
                isActive: true,
            },
            {
                id: outsiderCandidateId,
                email: 'candidate.outside.client.e2e@test.com',
                nickname: 'Candidate Outside',
                passwordHash,
                isActive: true,
            },
        ]);

        await dataSource.getRepository(UserRole).insert([
            { userId: clientId, role: Role.CLIENT },
            { userId: otherClientId, role: Role.CLIENT },
            { userId: recruiterId, role: Role.RECRUITER },
            { userId: candidateAId, role: Role.CANDIDATE },
            { userId: candidateBId, role: Role.CANDIDATE },
            { userId: outsiderCandidateId, role: Role.CANDIDATE },
        ]);

        companyAId = ulidService.generate();
        companyBId = ulidService.generate();
        outsiderCompanyId = ulidService.generate();

        await dataSource.getRepository(Company).insert([
            {
                id: companyAId,
                name: 'Client Owned A',
                email: encText(encryptionService, 'client-owned-a@test.com') as any,
                clientId,
                location: encText(encryptionService, 'Calgary') as any,
            },
            {
                id: companyBId,
                name: 'Client Owned B',
                email: encText(encryptionService, 'client-owned-b@test.com') as any,
                clientId,
                location: encText(encryptionService, 'Edmonton') as any,
            },
            {
                id: outsiderCompanyId,
                name: 'Other Client Owned',
                email: encText(encryptionService, 'other-client-owned@test.com') as any,
                clientId: otherClientId,
                location: encText(encryptionService, 'Toronto') as any,
            },
        ]);

        jobAId = ulidService.generate();
        jobBId = ulidService.generate();
        outsiderJobId = ulidService.generate();

        await dataSource.getRepository(JobOrder).insert([
            {
                id: jobAId,
                title: 'Owned Job A',
                description: 'Client company A order',
                status: 'sourcing',
                priority: 'high',
                openings: 1,
                companyId: companyAId,
                assignedToId: recruiterId,
            },
            {
                id: jobBId,
                title: 'Owned Job B',
                description: 'Client company B order',
                status: 'interview',
                priority: 'medium',
                openings: 1,
                companyId: companyBId,
                assignedToId: recruiterId,
            },
            {
                id: outsiderJobId,
                title: 'Outsider Job',
                description: 'Other client order',
                status: 'sourcing',
                priority: 'low',
                openings: 1,
                companyId: outsiderCompanyId,
                assignedToId: recruiterId,
            },
        ]);

        appAId = ulidService.generate();
        appBId = ulidService.generate();
        outsiderAppId = ulidService.generate();

        await dataSource.getRepository(Application).insert([
            {
                id: appAId,
                jobOrderId: jobAId,
                candidateId: candidateAId,
                status: 'new',
                source: 'recruiter_import',
                location: encText(encryptionService, 'Calgary') as any,
            },
            {
                id: appBId,
                jobOrderId: jobBId,
                candidateId: candidateBId,
                status: 'interview',
                source: 'recruiter_import',
                location: encText(encryptionService, 'Edmonton') as any,
            },
            {
                id: outsiderAppId,
                jobOrderId: outsiderJobId,
                candidateId: outsiderCandidateId,
                status: 'new',
                source: 'recruiter_import',
                location: encText(encryptionService, 'Toronto') as any,
            },
        ]);

        const clientLogin = await request(app.getHttpServer())
            .post('/auth/login/password')
            .send({ email: 'client.e2e@test.com', password: 'Pass123!@#' });
        clientToken = clientLogin.body.access_token;

        const recruiterLogin = await request(app.getHttpServer())
            .post('/auth/login/password')
            .send({ email: 'recruiter.client.e2e@test.com', password: 'Pass123!@#' });
        recruiterToken = recruiterLogin.body.access_token;
    }

    describe('RBAC', () => {
        it('GET /client/orders returns 401 when unauthenticated', async () => {
            const res = await request(app.getHttpServer()).get('/client/orders');
            expect(res.status).toBe(401);
        });

        it('GET /client/orders returns 403 for wrong role', async () => {
            const res = await request(app.getHttpServer())
                .get('/client/orders')
                .set('Authorization', `Bearer ${recruiterToken}`);
            expect(res.status).toBe(403);
        });
    });

    describe('GET /client/orders', () => {
        it('includes orders from all companies owned by this client', async () => {
            const res = await request(app.getHttpServer())
                .get('/client/orders?page=1&limit=20')
                .set('Authorization', `Bearer ${clientToken}`);

            expect(res.status).toBe(200);
            expect(res.body.total).toBe(2);

            const orderIds = res.body.data.map((o: any) => o.id);
            expect(orderIds).toContain(jobAId);
            expect(orderIds).toContain(jobBId);
            expect(orderIds).not.toContain(outsiderJobId);

            const companyIds = res.body.data.map((o: any) => o.companyId);
            expect(companyIds).toContain(companyAId);
            expect(companyIds).toContain(companyBId);
            expect(companyIds).not.toContain(outsiderCompanyId);
        });
    });

    describe('GET /client/candidates', () => {
        it('includes applications across all owned companies and excludes others', async () => {
            const res = await request(app.getHttpServer())
                .get('/client/candidates?page=1&limit=20')
                .set('Authorization', `Bearer ${clientToken}`);

            expect(res.status).toBe(200);
            expect(res.body.total).toBe(2);

            const applicationIds = res.body.data.map((a: any) => a.id);
            expect(applicationIds).toContain(appAId);
            expect(applicationIds).toContain(appBId);
            expect(applicationIds).not.toContain(outsiderAppId);

            const jobOrderIds = res.body.data.map((a: any) => a.jobOrderId);
            expect(jobOrderIds).toContain(jobAId);
            expect(jobOrderIds).toContain(jobBId);
            expect(jobOrderIds).not.toContain(outsiderJobId);
        });
    });
});
