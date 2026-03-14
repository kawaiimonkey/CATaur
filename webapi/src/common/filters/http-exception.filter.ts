import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

interface ErrorResponse {
    statusCode: number;
    message: string | string[];
    error: string;
    requestId: string;
    timestamp: string;
    path: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status = this.getHttpStatus(exception);
        const requestId = response.getHeader('x-request-id') as string;
        const errorResponse = this.buildErrorResponse(
            exception,
            status,
            requestId,
            request.url,
        );

        this.logError(exception, request, errorResponse);
        response.status(status).json(errorResponse);
    }

    private getHttpStatus(exception: unknown): number {
        return exception instanceof HttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;
    }

    private getErrorMessage(exception: unknown): string | string[] {
        if (!(exception instanceof HttpException)) {
            return 'Internal server error';
        }

        const exceptionResponse = exception.getResponse();
        if (typeof exceptionResponse === 'string') {
            return exceptionResponse;
        }

        if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
            const response = exceptionResponse as Record<string, any>;
            return response.message || exception.message;
        }

        return exception.message;
    }

    private getErrorName(exception: unknown): string {
        if (exception instanceof HttpException) {
            return exception.constructor.name;
        }
        return 'Internal Server Error';
    }

    private buildErrorResponse(
        exception: unknown,
        status: number,
        requestId: string,
        path: string,
    ): ErrorResponse {
        return {
            statusCode: status,
            message: this.getErrorMessage(exception),
            error: this.getErrorName(exception),
            requestId,
            timestamp: new Date().toISOString(),
            path,
        };
    }

    private logError(
        exception: unknown,
        request: Request,
        errorResponse: ErrorResponse,
    ): void {
        const isAiChat = request.url?.startsWith('/ai/chat/completions');

        const logData: Record<string, any> = {
            status: errorResponse.statusCode,
            path: request.url,
            method: request.method,
            requestId: errorResponse.requestId,
            body: isAiChat ? undefined : request.body,
            err: exception instanceof Error ? exception : undefined,
        };

        // 记录 HttpException 的详细响应信息（包含验证错误等）
        if (exception instanceof HttpException) {
            logData.exceptionResponse = exception.getResponse();
        }

        this.logger.error(
            logData,
            `Exception at ${request.method} ${request.url}`,
        );
    }
}
