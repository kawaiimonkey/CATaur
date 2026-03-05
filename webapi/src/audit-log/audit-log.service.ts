import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../database/entities/audit-log.entity';
import { UlidService } from '../common/ulid.service';

@Injectable()
export class AuditLogService {
    constructor(
        @InjectRepository(AuditLog)
        private readonly auditLogRepository: Repository<AuditLog>,
        private readonly ulidService: UlidService,
    ) { }

    /**
     * Create an audit log entry
     * @param data Partial audit log data
     */
    async create(data: Partial<AuditLog>): Promise<AuditLog> {
        const auditLog = this.auditLogRepository.create({
            id: this.ulidService.generate(),
            ...data,
            createdAt: new Date(),
        });
        return this.auditLogRepository.save(auditLog);
    }
}
