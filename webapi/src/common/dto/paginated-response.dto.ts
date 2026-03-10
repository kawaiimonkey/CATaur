import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { Type } from '@nestjs/common';

export class PaginatedResponseDto {
    @ApiProperty({ description: 'Total number of items' })
    total: number;

    @ApiProperty({ description: 'Current page number' })
    page: number;

    @ApiProperty({ description: 'Number of items per page' })
    limit: number;

    @ApiProperty({ description: 'Total number of pages' })
    totalPages: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export function createPaginatedResponseDto<T>(itemType: Type<T>) {
    class PaginatedResponseDtoWithData extends PaginatedResponseDto {
        @ApiProperty({
            type: 'array',
            items: { $ref: getSchemaPath(itemType) },
        })
        data: T[];
    }

    Object.defineProperty(PaginatedResponseDtoWithData, 'name', {
        value: `Paginated${itemType.name}ResponseDto`,
    });

    return PaginatedResponseDtoWithData;
}
