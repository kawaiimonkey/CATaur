import { ApiProperty } from '@nestjs/swagger';
import { createPaginatedResponseDto } from '../../common/dto/paginated-response.dto';

export class AuditLogActorDto {
    @ApiProperty()
    nickname: string;

    @ApiProperty()
    email: string;

    @ApiProperty({ type: [String] })
    roles: string[];
}

export class AuditLogItemDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty({ type: AuditLogActorDto, required: false })
    actor: AuditLogActorDto | null;

    @ApiProperty()
    route: string;

    @ApiProperty()
    httpMethod: string;

    @ApiProperty({ description: 'The description of the action' })
    actionType: string;

    @ApiProperty({ required: false, type: Object })
    httpRequestBody: any;

    @ApiProperty({ required: false, type: String })
    ipAddress: string;
}

export class PaginatedAuditLogResponseDto extends createPaginatedResponseDto(AuditLogItemDto) {}
