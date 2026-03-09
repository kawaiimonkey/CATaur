import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { AuditLog } from '../database/entities/audit-log.entity';
import { UlidService } from '../common/ulid.service';

@Injectable()
export class AuditLogService {
    private readonly logger = new Logger(AuditLogService.name);

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

        try {
            return await this.auditLogRepository.save(auditLog);
        } catch (error) {
            if (this.isActorForeignKeyError(error) && auditLog.actorId) {
                this.logger.warn(`actorId ${auditLog.actorId} no longer exists, retrying with null actorId`);
                auditLog.actorId = null;
                return this.auditLogRepository.save(auditLog);
            }
            throw error;
        }
    }

    private isActorForeignKeyError(error: unknown): boolean {
        if (!(error instanceof QueryFailedError)) {
            return false;
        }

        const driverError = (error as any).driverError as {
            errno?: number;
            code?: string;
            sqlMessage?: string;
            message?: string;
        } | undefined;

        if (!driverError) {
            return false;
        }

        const message = driverError.sqlMessage ?? driverError.message ?? error.message ?? '';
        return (
            (driverError.errno === 1452 || driverError.code === 'ER_NO_REFERENCED_ROW_2') &&
            message.includes('actorId')
        );
    }
}
