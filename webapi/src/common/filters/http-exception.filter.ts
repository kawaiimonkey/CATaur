import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ApiResponse } from '../dto/api-response.dto';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger('Exceptions');

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const requestId = response.getHeader('x-request-id') as string;

        // 获取错误消息
        const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : null;
        const message =
            exception instanceof HttpException
                ? (typeof exceptionResponse === 'object' && exceptionResponse !== null
                    ? (exceptionResponse as any).message || exception.message
                    : exception.message)
                : 'Internal server error';

        // 写入结构化日志
        this.logger.error(
            {
                status,
                path: request.url,
                method: request.method,
                requestId,
                body: request.body,
                err: exception instanceof Error ? exception : undefined, // Standard key for Pino/pino-pretty
            },
            `Exception at ${request.method} ${request.url}`,
        );

        // 返回符合 NestJS 标准但包含 requestId 的错误格式
        response.status(status).json({
            statusCode: status,
            message: message,
            error: exception instanceof HttpException ? (exception as any).name : 'Internal Server Error',
            requestId: requestId,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
}
