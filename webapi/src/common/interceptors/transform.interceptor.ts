import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../dto/api-response.dto';
import { Response } from 'express';

@Injectable()
export class TransformInterceptor<T>
    implements NestInterceptor<T, ApiResponse<T>> {
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<ApiResponse<T>> {
        const res = context.switchToHttp().getResponse<Response>();
        const requestId = res.getHeader('x-request-id') as string;

        return next.handle().pipe(
            map((data) => {
                // If the data is already an ApiResponse, just return it
                if (data instanceof ApiResponse) {
                    return data;
                }
                return ApiResponse.success(data, 'Success', requestId);
            }),
        );
    }
}
