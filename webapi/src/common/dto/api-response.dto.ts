import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { Type } from '@nestjs/common';

export class ApiResponse<T> {
    @ApiProperty()
    success: boolean;

    @ApiProperty({ required: false })
    message?: string;

    @ApiProperty({ required: false })
    data?: T;

    @ApiProperty({ required: false })
    requestId?: string;

    @ApiProperty()
    timestamp: string;

    constructor(success: boolean, data?: T, message?: string, requestId?: string) {
        this.success = success;
        this.data = data;
        this.message = message;
        this.requestId = requestId;
        this.timestamp = new Date().toISOString();
    }

    static success<T>(data: T, message?: string, requestId?: string): ApiResponse<T> {
        return new ApiResponse(true, data, message, requestId);
    }

    static error(message: string, requestId?: string): ApiResponse<null> {
        return new ApiResponse(false, null, message, requestId);
    }
}

export function createApiResponseDto<T>(dataType: Type<T>) {
    class ApiResponseWithData extends ApiResponse<T> {
        @ApiProperty({
            oneOf: [
                { $ref: getSchemaPath(dataType) },
                { type: 'null' },
            ],
        })
        data: T | null;
    }

    return ApiResponseWithData;
}
