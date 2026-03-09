import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, from, throwError } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';
import { AUDIT_LOG_ACTION_KEY } from '../decorators/audit-log.decorator';
import { AuditLogService } from '../../audit-log/audit-log.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
    private readonly logger = new Logger(AuditLogInterceptor.name);

    constructor(
        private reflector: Reflector,
        private auditLogService: AuditLogService,
    ) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const actionType = this.reflector.get<string>(
            AUDIT_LOG_ACTION_KEY,
            context.getHandler(),
        );

        // If no action type is specified via decorator, just proceed without logging
        if (!actionType) {
            return next.handle();
        }

        const request = context.switchToHttp().getRequest();
        const { method, path: route, body, ip, user } = request;
        const sanitizedBody = this.sanitizeBody(body);

        return next.handle().pipe(
            mergeMap((data) =>
                from(
                    this.auditLogService.create({
                        actionType,
                        httpMethod: method,
                        route,
                        httpRequestBody: sanitizedBody,
                        ipAddress: ip,
                        httpStatusCode: context.switchToHttp().getResponse().statusCode,
                        actorId: user?.id || null,
                    }),
                ).pipe(
                    catchError((error) => {
                        this.logger.error('Failed to save audit log:', error.stack);
                        return from([null]);
                    }),
                    mergeMap(() => from([data])),
                ),
            ),
            catchError((err) => {
                const statusCode = err.status || 500;
                return from(
                    this.auditLogService.create({
                        actionType: `${actionType} (FAILED)`,
                        httpMethod: method,
                        route,
                        httpRequestBody: sanitizedBody,
                        ipAddress: ip,
                        httpStatusCode: statusCode,
                        actorId: user?.id || null,
                    }),
                ).pipe(
                    catchError((error) => {
                        this.logger.error('Failed to save error audit log:', error.stack);
                        return from([null]);
                    }),
                    mergeMap(() => throwError(() => err)),
                );
            }),
        );
    }

    /**
     * Remove sensitive fields from the request body
     */
    private sanitizeBody(body: any): any {
        if (!body || typeof body !== 'object') {
            return body;
        }

        const sensitiveKeys = ['password', 'oldPassword', 'newPassword'];
        const sanitized = { ...body };

        for (const key of sensitiveKeys) {
            if (key in sanitized) {
                delete sanitized[key];
            }
        }

        return sanitized;
    }
}
