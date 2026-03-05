import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

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

    @ApiProperty({ type: AuditLogActorDto, nullable: true })
    actor: AuditLogActorDto | null;

    @ApiProperty()
    route: string;

    @ApiProperty()
    httpMethod: string;

    @ApiProperty({ description: 'The description of the action' })
    actionType: string;

    @ApiProperty({ required: false, nullable: true })
    httpRequestBody: any;

    @ApiProperty({ required: false, nullable: true })
    ipAddress: string;
}

export class PaginatedAuditLogResponseDto extends PaginatedResponseDto {
    @ApiProperty({ type: [AuditLogItemDto] })
    data: AuditLogItemDto[];
}
