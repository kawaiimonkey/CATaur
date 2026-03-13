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

describe('Recruiter APIs (e2e)', () => {
    let app: INestApplication;
    let dataSource: DataSource;
    let ulidService: UlidService;
    let encryptionService: EncryptionService;

    let recruiterToken: string;
    let otherRecruiterToken: string;
    let clientToken: string;

    let recruiterId: string;
    let otherRecruiterId: string;
    let clientId: string;

    let companyAId: string;
    let companyBId: string;

    let candidateAId: string;
    let candidateBId: string;
    let outsiderCandidateId: string;

    let jobOrderAId: string;
    let jobOrderBId: string;

    let applicationAId: string;
    let applicationBId: string;

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
        await dataSource.createQueryBuilder().delete().from(AuditLog).execute();
        await dataSource.createQueryBuilder().delete().from(Application).execute();
        await dataSource.createQueryBuilder().delete().from(JobOrder).execute();
        await dataSource.createQueryBuilder().delete().from(Company).execute();
        await dataSource.createQueryBuilder().delete().from(UserRole).execute();
        await dataSource.createQueryBuilder().delete().from(User).execute();
    }

    async function seedData() {
        const recruiterPassword = await bcrypt.hash('recPass123!', 12);
        const otherRecruiterPassword = await bcrypt.hash('otherRecPass123!', 12);
        const clientPassword = await bcrypt.hash('clientPass123!', 12);
        const candidatePassword = await bcrypt.hash('candPass123!', 12);

        recruiterId = ulidService.generate();
        otherRecruiterId = ulidService.generate();
        clientId = ulidService.generate();
        candidateAId = ulidService.generate();
        candidateBId = ulidService.generate();
        outsiderCandidateId = ulidService.generate();

        await dataSource.getRepository(User).insert([
            {
                id: recruiterId,
                email: 'recruiter.e2e@test.com',
                nickname: 'Recruiter E2E',
                passwordHash: recruiterPassword,
                isActive: true,
            },
            {
                id: otherRecruiterId,
                email: 'recruiter.other.e2e@test.com',
                nickname: 'Recruiter Other',
                passwordHash: otherRecruiterPassword,
                isActive: true,
            },
            {
                id: clientId,
                email: 'client.e2e@test.com',
                nickname: 'Client E2E',
                passwordHash: clientPassword,
                isActive: true,
            },
            {
                id: candidateAId,
                email: 'candidate.a.e2e@test.com',
                nickname: 'Candidate A',
                passwordHash: candidatePassword,
                isActive: true,
                phone: encText(encryptionService, '111-1111') as any,
            },
            {
                id: candidateBId,
                email: 'candidate.b.e2e@test.com',
                nickname: 'Candidate B',
                passwordHash: candidatePassword,
                isActive: true,
                phone: encText(encryptionService, '222-2222') as any,
            },
            {
                id: outsiderCandidateId,
                email: 'candidate.outside.e2e@test.com',
                nickname: 'Outside Candidate',
                passwordHash: candidatePassword,
                isActive: true,
                phone: encText(encryptionService, '333-3333') as any,
            },
        ]);

        await dataSource.getRepository(UserRole).insert([
            { userId: recruiterId, role: Role.RECRUITER },
            { userId: otherRecruiterId, role: Role.RECRUITER },
            { userId: clientId, role: Role.CLIENT },
            { userId: candidateAId, role: Role.CANDIDATE },
            { userId: candidateBId, role: Role.CANDIDATE },
            { userId: outsiderCandidateId, role: Role.CANDIDATE },
        ]);

        companyAId = ulidService.generate();
        companyBId = ulidService.generate();

        await dataSource.getRepository(Company).insert([
            {
                id: companyAId,
                name: 'Recruiter Company A',
                email: encText(encryptionService, 'company.a@test.com') as any,
                clientId,
                location: encText(encryptionService, 'Calgary') as any,
            },
            {
                id: companyBId,
                name: 'Recruiter Company B',
                email: encText(encryptionService, 'company.b@test.com') as any,
                clientId,
                location: encText(encryptionService, 'Edmonton') as any,
            },
        ]);

        jobOrderAId = ulidService.generate();
        jobOrderBId = ulidService.generate();

        await dataSource.getRepository(JobOrder).insert([
            {
                id: jobOrderAId,
                title: 'Backend Engineer',
                description: 'Role A',
                status: 'sourcing',
                priority: 'high',
                openings: 1,
                companyId: companyAId,
                assignedToId: recruiterId,
            },
            {
                id: jobOrderBId,
                title: 'Frontend Engineer',
                description: 'Role B',
                status: 'sourcing',
                priority: 'medium',
                openings: 1,
                companyId: companyBId,
                assignedToId: otherRecruiterId,
            },
        ]);

        applicationAId = ulidService.generate();
        applicationBId = ulidService.generate();

        await dataSource.getRepository(Application).insert([
            {
                id: applicationAId,
                jobOrderId: jobOrderAId,
                candidateId: candidateAId,
                status: 'new',
                source: 'recruiter_import',
                location: encText(encryptionService, 'Calgary') as any,
                availability: 'Immediate',
                recruiterNotes: encText(encryptionService, 'Strong backend profile') as any,
            },
            {
                id: applicationBId,
                jobOrderId: jobOrderBId,
                candidateId: candidateBId,
                status: 'new',
                source: 'recruiter_import',
                location: encText(encryptionService, 'Edmonton') as any,
                availability: '2 weeks',
                recruiterNotes: encText(encryptionService, 'Strong frontend profile') as any,
            },
        ]);

        const recruiterLogin = await request(app.getHttpServer())
            .post('/auth/login/password')
            .send({ email: 'recruiter.e2e@test.com', password: 'recPass123!' });
        recruiterToken = recruiterLogin.body.access_token;

        const otherRecruiterLogin = await request(app.getHttpServer())
            .post('/auth/login/password')
            .send({ email: 'recruiter.other.e2e@test.com', password: 'otherRecPass123!' });
        otherRecruiterToken = otherRecruiterLogin.body.access_token;

        const clientLogin = await request(app.getHttpServer())
            .post('/auth/login/password')
            .send({ email: 'client.e2e@test.com', password: 'clientPass123!' });
        clientToken = clientLogin.body.access_token;
    }

    describe('RBAC', () => {
        it('blocks unauthenticated recruiter endpoint access', async () => {
            const res = await request(app.getHttpServer()).get('/recruiter/candidates');
            expect(res.status).toBe(401);
        });

        it('blocks non-recruiter role access', async () => {
            const res = await request(app.getHttpServer())
                .get('/recruiter/candidates')
                .set('Authorization', `Bearer ${clientToken}`);
            expect(res.status).toBe(403);
        });
    });

    describe('Candidate endpoints', () => {
        it('GET /recruiter/candidates lists only my assigned candidates', async () => {
            const res = await request(app.getHttpServer())
                .get('/recruiter/candidates?page=1&limit=20')
                .set('Authorization', `Bearer ${recruiterToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(1);
            expect(res.body.data[0].id).toBe(applicationAId);
        });

        it('GET /recruiter/candidates supports location filter', async () => {
            const hit = await request(app.getHttpServer())
                .get('/recruiter/candidates?location=Calgary')
                .set('Authorization', `Bearer ${recruiterToken}`);

            expect(hit.status).toBe(200);
            expect(hit.body.data).toHaveLength(1);
            expect(hit.body.data[0].id).toBe(applicationAId);

            const miss = await request(app.getHttpServer())
                .get('/recruiter/candidates?location=Vancouver')
                .set('Authorization', `Bearer ${recruiterToken}`);

            expect(miss.status).toBe(200);
            expect(miss.body.data).toHaveLength(0);
        });

        it('GET /recruiter/candidates/:id returns own scoped candidate', async () => {
            const res = await request(app.getHttpServer())
                .get(`/recruiter/candidates/${applicationAId}`)
                .set('Authorization', `Bearer ${recruiterToken}`);

            expect(res.status).toBe(200);
            expect(res.body.id).toBe(applicationAId);
            expect(res.body.candidate.id).toBe(candidateAId);
        });

        it('GET /recruiter/candidates/:id returns 404 for unscoped candidate', async () => {
            const res = await request(app.getHttpServer())
                .get(`/recruiter/candidates/${applicationBId}`)
                .set('Authorization', `Bearer ${recruiterToken}`);

            expect(res.status).toBe(404);
        });

        it('PUT /recruiter/candidates/:id updates application and candidate profile', async () => {
            const payload = {
                location: 'Toronto',
                availability: '1 week',
                recruiterNotes: 'Updated by recruiter',
                status: 'interview',
                nickname: 'Candidate A Updated',
                email: 'candidate.a.updated.e2e@test.com',
                phone: '999-9999',
            };

            const res = await request(app.getHttpServer())
                .put(`/recruiter/candidates/${applicationAId}`)
                .set('Authorization', `Bearer ${recruiterToken}`)
                .send(payload);

            expect(res.status).toBe(200);
            expect(res.body.location).toBe('Toronto');
            expect(res.body.availability).toBe('1 week');
            expect(res.body.recruiterNotes).toBe('Updated by recruiter');
            expect(res.body.status).toBe('interview');
            expect(res.body.candidate.nickname).toBe('Candidate A Updated');
            expect(res.body.candidate.email).toBe('candidate.a.updated.e2e@test.com');
            expect(res.body.candidate.phone).toBe('999-9999');
        });

        it('PUT /recruiter/candidates/:id enforces unique email', async () => {
            const res = await request(app.getHttpServer())
                .put(`/recruiter/candidates/${applicationAId}`)
                .set('Authorization', `Bearer ${recruiterToken}`)
                .send({ email: 'candidate.outside.e2e@test.com' });

            expect(res.status).toBe(409);
        });

        it('PUT /recruiter/candidates/:id returns 404 for unscoped candidate', async () => {
            const res = await request(app.getHttpServer())
                .put(`/recruiter/candidates/${applicationBId}`)
                .set('Authorization', `Bearer ${recruiterToken}`)
                .send({ nickname: 'Should not update' });

            expect(res.status).toBe(404);
        });
    });

    describe('Company endpoints', () => {
        it('GET /recruiter/companies lists companies', async () => {
            const res = await request(app.getHttpServer())
                .get('/recruiter/companies?page=1&limit=10')
                .set('Authorization', `Bearer ${recruiterToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.length).toBeGreaterThanOrEqual(2);
        });

        it('GET /recruiter/companies/:id returns company detail', async () => {
            const res = await request(app.getHttpServer())
                .get(`/recruiter/companies/${companyAId}`)
                .set('Authorization', `Bearer ${recruiterToken}`);

            expect(res.status).toBe(200);
            expect(res.body.id).toBe(companyAId);
            expect(res.body.name).toBe('Recruiter Company A');
            if (res.body.client) {
                expect(res.body.client.passwordHash).toBeUndefined();
                expect(res.body.client.totpSecretEnc).toBeUndefined();
            }
        });

        it('POST /recruiter/companies creates a company', async () => {
            const payload = {
                name: 'Recruiter Created Co',
                email: 'recruiter.created.co@test.com',
                location: 'Calgary',
                clientAccountId: clientId,
            };

            const res = await request(app.getHttpServer())
                .post('/recruiter/companies')
                .set('Authorization', `Bearer ${recruiterToken}`)
                .send(payload);

            expect([200, 201]).toContain(res.status);
            expect(res.body.name).toBe(payload.name);
            expect(res.body.clientId).toBe(clientId);
        });

        it('PUT /recruiter/companies/:id updates company', async () => {
            const res = await request(app.getHttpServer())
                .put(`/recruiter/companies/${companyAId}`)
                .set('Authorization', `Bearer ${recruiterToken}`)
                .send({ name: 'Recruiter Company A Updated', location: 'Red Deer' });

            expect(res.status).toBe(200);
            expect(res.body.name).toBe('Recruiter Company A Updated');
            expect(res.body.location).toBe('Red Deer');
        });
    });

    describe('Cross-recruiter scope sanity', () => {
        it('other recruiter sees only their candidate', async () => {
            const res = await request(app.getHttpServer())
                .get('/recruiter/candidates')
                .set('Authorization', `Bearer ${otherRecruiterToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(1);
            expect(res.body.data[0].id).toBe(applicationBId);
        });
    });
});
