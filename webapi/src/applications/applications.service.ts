import {
    Injectable,
    Logger,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, In } from 'typeorm';
import { Application } from '../database/entities/application.entity';
import { JobOrder } from '../database/entities/job-order.entity';
import { User } from '../database/entities/user.entity';
import {
    CreateApplicationDto,
    UpdateApplicationStatusDto,
    SubmitDecisionDto,
    BulkImportDto,
} from './dto/application.dto';
import { UlidService } from '../common/ulid.service';
import { EmailService } from '../common/email.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ApplicationsService {
    private readonly logger = new Logger(ApplicationsService.name);

    constructor(
        @InjectRepository(Application)
        private repo: Repository<Application>,
        @InjectRepository(JobOrder)
        private jobOrderRepo: Repository<JobOrder>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
        private ulidService: UlidService,
        private emailService: EmailService,
        private notificationsService: NotificationsService,
    ) {}

    /**
     * scope:
     *   Recruiter → { jobOrder: { assignedToId: recruiterId } }
     *   Client    → { jobOrder: { companyId: In([...]) } }
     *   Admin     → {}
     */
    async findAll(
        scope: Partial<{ assignedToId: string; companyIds: string[] }>,
        opts: { page?: number; limit?: number; status?: string; jobOrderId?: string; search?: string } = {},
    ) {
        const { page = 1, limit = 20, status, jobOrderId, search } = opts;

        const qb = this.repo.createQueryBuilder('app')
            .leftJoinAndSelect('app.candidate', 'candidate')
            .leftJoinAndSelect('app.jobOrder', 'jobOrder')
            .leftJoinAndSelect('jobOrder.company', 'company');

        if (scope.assignedToId) {
            qb.andWhere('jobOrder.assignedToId = :rid', { rid: scope.assignedToId });
        }
        if (scope.companyIds?.length) {
            qb.andWhere('jobOrder.companyId IN (:...cids)', { cids: scope.companyIds });
        }
        if (status) qb.andWhere('app.status = :status', { status });
        if (jobOrderId) qb.andWhere('app.jobOrderId = :jobOrderId', { jobOrderId });
        if (search) {
            qb.andWhere('(candidate.nickname LIKE :s OR candidate.email LIKE :s)', {
                s: `%${search}%`,
            });
        }

        const [data, total] = await qb
            .orderBy('app.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    async findOne(
        id: string,
        scope: Partial<{ assignedToId: string; companyIds: string[] }> = {},
    ): Promise<Application> {
        const app = await this.repo.findOne({
            where: { id },
            relations: ['candidate', 'jobOrder', 'jobOrder.company'],
        });
        if (!app) throw new NotFoundException('Application not found');

        // Scope check
        if (scope.assignedToId && app.jobOrder?.assignedToId !== scope.assignedToId) {
            throw new NotFoundException('Application not found');
        }
        if (scope.companyIds?.length && !scope.companyIds.includes(app.jobOrder?.companyId ?? '')) {
            throw new NotFoundException('Application not found');
        }
        return app;
    }

    async create(dto: CreateApplicationDto, source: 'self_applied' | 'recruiter_import' = 'recruiter_import'): Promise<Application> {
        const app = this.repo.create({
            id: this.ulidService.generate(),
            jobOrderId: dto.jobOrderId,
            candidateId: dto.candidateId,
            status: 'new',
            source,
            location: dto.location ?? null,
            availability: dto.availability ?? null,
            recruiterNotes: dto.recruiterNotes ?? null,
        });
        await this.repo.save(app);
        this.logger.log(`Application created: ${app.id} (${source}) candidate=${dto.candidateId} job=${dto.jobOrderId}`);
        return this.findOne(app.id);
    }

    async bulkImport(dto: BulkImportDto): Promise<Application[]> {
        const results: Application[] = [];
        for (const c of dto.candidates) {
            // Find or create a ghost user for the candidate
            let candidate = await this.userRepo.findOne({ where: { email: c.email } });
            if (!candidate) {
                candidate = this.userRepo.create({
                    id: this.ulidService.generate(),
                    email: c.email,
                    nickname: c.name,
                    passwordHash: '',  // no login allowed until they self-register
                    isActive: false,
                    phone: c.phone ?? null,
                });
                await this.userRepo.save(candidate);
            }
            const app = await this.create(
                {
                    jobOrderId: dto.jobOrderId,
                    candidateId: candidate.id,
                    location: c.location,
                    availability: c.availability,
                },
                'recruiter_import',
            );
            results.push(app);
        }
        this.logger.log(`Bulk import: ${results.length} applications created for job ${dto.jobOrderId}`);
        return results;
    }

    async updateStatus(
        id: string,
        dto: UpdateApplicationStatusDto,
        scope: Partial<{ assignedToId: string; companyIds: string[] }> = {},
    ): Promise<Application> {
        const app = await this.findOne(id, scope);
        const prevStatus = app.status;
        app.status = dto.status as any;

        if (dto.status === 'interview') {
            if (!dto.interviewDate || !dto.interviewContent) {
                throw new BadRequestException('Interview date and content are required');
            }
            app.interviewSubject = dto.interviewSubject ?? `Interview Invitation — ${app.jobOrder?.title}`;
            app.interviewType = dto.interviewType ?? 'Zoom';
            app.interviewDate = dto.interviewDate;
            app.interviewTime = dto.interviewTime ?? '';
            app.interviewContent = dto.interviewContent;
            app.interviewSentAt = new Date();

            // Send interview email to candidate
            await this.emailService.sendInterviewInvitation(
                app.candidate.email,
                app.interviewSubject,
                app.interviewContent,
            ).catch((err) => {
                this.logger.error(`Failed to send interview email for application ${id}: ${err?.message}`);
            });
        }

        if (dto.status === 'offer' && prevStatus !== 'offer') {
            // Notify the client that an offer is being extended
            const jo = await this.jobOrderRepo.findOne({
                where: { id: app.jobOrderId },
                relations: ['company'],
            });
            if (jo?.company?.clientId) {
                await this.notificationsService.create(
                    jo.company.clientId,
                    'offer_extended',
                    'Offer Extended',
                    `An offer has been extended to ${app.candidate.nickname} for ${jo.title}.`,
                    app.id,
                );
            }
        }

        await this.repo.save(app);
        this.logger.log(`Application ${id} status updated to "${dto.status}"`);
        return app;
    }

    async submitDecision(
        id: string,
        dto: SubmitDecisionDto,
        companyIds: string[],
    ): Promise<Application> {
        const app = await this.findOne(id, { companyIds });
        app.clientDecisionType = dto.type as any;
        app.clientDecisionNote = dto.note ?? null;
        app.clientDecisionAt = new Date();
        await this.repo.save(app);

        // Notify the recruiter
        if (app.jobOrder?.assignedToId) {
            await this.notificationsService.create(
                app.jobOrder.assignedToId,
                'client_decision',
                'Client Decision Received',
                `Client decision "${dto.type}" for ${app.candidate?.nickname ?? 'candidate'}.`,
                app.id,
            );
        }
        this.logger.log(`Client decision "${dto.type}" received for application ${id}`);
        return app;
    }

    async delete(id: string): Promise<void> {
        const app = await this.repo.findOne({ where: { id } });
        if (!app) throw new NotFoundException('Application not found');
        await this.repo.remove(app);
        this.logger.log(`Application deleted: ${id}`);
    }
}
