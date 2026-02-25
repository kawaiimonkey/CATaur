import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../database/entities/audit-log.entity';
import { UlidService } from '../common/ulid.service';

@Injectable()
export class ActivityInterceptor implements NestInterceptor {
    constructor(
        @InjectRepository(AuditLog)
        private auditLogRepository: Repository<AuditLog>,
        private ulidService: UlidService
    ) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();
        const { method, url, body, user } = req;

        // Only intercept modifying actions
        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
            return next.handle().pipe(
                tap(() => {
                    // Fire and forget recording
                    this.recordLog(method, url, body, user?.id).catch(err => console.error('Failed to save audit log', err));
                }),
            );
        }

        return next.handle();
    }

    private async recordLog(method: string, url: string, body: any, userId?: string) {
        let actionType = `${method} ${url.split('?')[0]}`;
        
        // Enhance readability for common actions
        if (url.includes('/auth/login')) actionType = 'USER_LOGIN';
        else if (url.includes('/auth/register')) actionType = 'USER_REGISTER';
        else if (url.includes('/admin/users') && method === 'POST') actionType = 'ADMIN_CREATE_USER';
        else if (url.includes('/admin/users') && method === 'PUT') actionType = 'ADMIN_UPDATE_USER';
        else if (url.includes('/admin/companies')) actionType = `ADMIN_${method}_COMPANY`;
        else if (url.includes('/admin/configs')) actionType = 'ADMIN_UPDATE_CONFIG';

        // Sanitize sensitive info
        const safeBody = body ? { ...body } : {};
        if (safeBody.password) safeBody.password = '***';
        if (safeBody.oldPassword) safeBody.oldPassword = '***';
        if (safeBody.newPassword) safeBody.newPassword = '***';

        const log = this.auditLogRepository.create({
            id: this.ulidService.generate(),
            actorId: userId || null, // Might be null for login/register
            actionType: actionType,
            actionDetails: safeBody,
        });

        await this.auditLogRepository.save(log);
    }
}
