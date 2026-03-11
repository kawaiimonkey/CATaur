import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { JobOrder } from '../database/entities/job-order.entity';
import { CreateJobOrderDto } from './dto/create-job-order.dto';
import { UpdateJobOrderDto } from './dto/update-job-order.dto';
import { UlidService } from '../common/ulid.service';
import { EncryptionService } from '../common/encryption.service';

@Injectable()
export class JobOrdersService {
    private readonly logger = new Logger(JobOrdersService.name);

    constructor(
        @InjectRepository(JobOrder)
        private repo: Repository<JobOrder>,
        private ulidService: UlidService,
        private encryptionService: EncryptionService,
    ) {}

    async findAll(
        where: FindOptionsWhere<JobOrder> & { companyIds?: string[] },
        opts: { page?: number; limit?: number; status?: string; statuses?: string[]; search?: string } = {},
    ) {
        const { page = 1, limit = 20, status, statuses, search } = opts;

        const qb = this.repo.createQueryBuilder('jo')
            .leftJoinAndSelect('jo.company', 'company')
            .leftJoinAndSelect('jo.assignedTo', 'assignedTo');

        // Apply caller-supplied scope (e.g. assignedToId / companyId)
        if (where.assignedToId) {
            qb.andWhere('jo.assignedToId = :assignedToId', { assignedToId: where.assignedToId });
        }
        if (where.companyId) {
            qb.andWhere('jo.companyId = :companyId', { companyId: where.companyId });
        }
        if (where.companyIds?.length) {
            qb.andWhere('jo.companyId IN (:...companyIds)', { companyIds: where.companyIds });
        }
        if (status) {
            qb.andWhere('jo.status = :status', { status });
        } else if (statuses?.length) {
            qb.andWhere('jo.status IN (:...statuses)', { statuses });
        }
        if (search) {
            qb.andWhere('jo.title LIKE :search', { search: `%${search}%` });
        }

        const [data, total] = await qb
            .orderBy('jo.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return {
            data: data.map((jobOrder) => this.decryptJobOrder(jobOrder)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findOne(id: string, where: FindOptionsWhere<JobOrder> = {}): Promise<JobOrder> {
        const jo = await this.repo.findOne({
            where: { id, ...where },
            relations: ['company', 'assignedTo'],
        });
        if (!jo) throw new NotFoundException('Job order not found');
        return this.decryptJobOrder(jo);
    }

    async create(dto: CreateJobOrderDto, recruiterId: string): Promise<JobOrder> {
        const jo = this.repo.create({
            id: this.ulidService.generate(),
            title: dto.title,
            description: dto.description ?? null,
            companyId: dto.companyId ?? null,
            priority: (dto.priority as any) ?? 'medium',
            location: dto.location
                ? (this.encryptionService.encryptText(dto.location) as unknown as string)
                : dto.location ?? null,
            openings: dto.openings ?? 1,
            salary: dto.salary
                ? (this.encryptionService.encryptText(dto.salary) as unknown as string)
                : dto.salary ?? null,
            tags: dto.tags ?? null,
            status: 'sourcing',
            assignedToId: recruiterId,
        });
        await this.repo.save(jo);
        this.logger.log(`Job order created: ${jo.id} ("${jo.title}") assigned to recruiter ${recruiterId}`);
        return this.findOne(jo.id);
    }

    async update(
        id: string,
        dto: UpdateJobOrderDto,
        scope: FindOptionsWhere<JobOrder> = {},
    ): Promise<JobOrder> {
        const jo = await this.findOne(id, scope);
        Object.assign(jo, {
            ...(dto.title !== undefined && { title: dto.title }),
            ...(dto.description !== undefined && { description: dto.description }),
            ...(dto.companyId !== undefined && { companyId: dto.companyId }),
            ...(dto.priority !== undefined && { priority: dto.priority }),
            ...(dto.location !== undefined && {
                location: dto.location
                    ? (this.encryptionService.encryptText(dto.location) as unknown as string)
                    : dto.location,
            }),
            ...(dto.openings !== undefined && { openings: dto.openings }),
            ...(dto.salary !== undefined && {
                salary: dto.salary
                    ? (this.encryptionService.encryptText(dto.salary) as unknown as string)
                    : dto.salary,
            }),
            ...(dto.tags !== undefined && { tags: dto.tags }),
        });
        await this.repo.save(jo);
        return this.findOne(id);
    }

    async updateStatus(
        id: string,
        status: string,
        scope: FindOptionsWhere<JobOrder> = {},
    ): Promise<JobOrder> {
        const jo = await this.findOne(id, scope);
        jo.status = status as any;
        await this.repo.save(jo);
        this.logger.log(`Job order ${id} status updated to "${status}"`);
        return jo;
    }

    async delete(id: string): Promise<void> {
        const jo = await this.repo.findOne({ where: { id } });
        if (!jo) throw new NotFoundException('Job order not found');
        await this.repo.remove(jo);
        this.logger.log(`Job order deleted: ${id}`);
    }

    private decryptJobOrder(jobOrder: JobOrder): JobOrder {
        jobOrder.location = jobOrder.location
            ? (this.encryptionService.decryptText(jobOrder.location as unknown as Buffer) as any)
            : jobOrder.location;
        jobOrder.salary = jobOrder.salary
            ? (this.encryptionService.decryptText(jobOrder.salary as unknown as Buffer) as any)
            : jobOrder.salary;
        return jobOrder;
    }
}
