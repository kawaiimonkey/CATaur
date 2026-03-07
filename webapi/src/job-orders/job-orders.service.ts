import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { JobOrder } from '../database/entities/job-order.entity';
import { CreateJobOrderDto } from './dto/create-job-order.dto';
import { UpdateJobOrderDto } from './dto/update-job-order.dto';
import { UlidService } from '../common/ulid.service';

@Injectable()
export class JobOrdersService {
    private readonly logger = new Logger(JobOrdersService.name);

    constructor(
        @InjectRepository(JobOrder)
        private repo: Repository<JobOrder>,
        private ulidService: UlidService,
    ) {}

    async findAll(
        where: FindOptionsWhere<JobOrder>,
        opts: { page?: number; limit?: number; status?: string; search?: string } = {},
    ) {
        const { page = 1, limit = 20, status, search } = opts;

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
        if (status) {
            qb.andWhere('jo.status = :status', { status });
        }
        if (search) {
            qb.andWhere('jo.title LIKE :search', { search: `%${search}%` });
        }

        const [data, total] = await qb
            .orderBy('jo.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    async findOne(id: string, where: FindOptionsWhere<JobOrder> = {}): Promise<JobOrder> {
        const jo = await this.repo.findOne({
            where: { id, ...where },
            relations: ['company', 'assignedTo'],
        });
        if (!jo) throw new NotFoundException('Job order not found');
        return jo;
    }

    async create(dto: CreateJobOrderDto, recruiterId: string): Promise<JobOrder> {
        const jo = this.repo.create({
            id: this.ulidService.generate(),
            title: dto.title,
            description: dto.description ?? null,
            companyId: dto.companyId ?? null,
            priority: (dto.priority as any) ?? 'medium',
            location: dto.location ?? null,
            openings: dto.openings ?? 1,
            salary: dto.salary ?? null,
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
            ...(dto.location !== undefined && { location: dto.location }),
            ...(dto.openings !== undefined && { openings: dto.openings }),
            ...(dto.salary !== undefined && { salary: dto.salary }),
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
}
