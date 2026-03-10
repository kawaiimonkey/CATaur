import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../database/entities/user-role.entity';
import { createPaginatedResponseDto } from '../../common/dto/paginated-response.dto';

export class UserRoleResponseDto {
    @ApiProperty()
    userId: string;

    @ApiProperty({ enum: Role })
    role: Role;
}

export class UserListItemDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    nickname: string;

    @ApiProperty()
    email: string;

    @ApiProperty({ required: false, nullable: true })
    phone?: string | null;

    @ApiProperty({ type: [UserRoleResponseDto] })
    roles: UserRoleResponseDto[];

    @ApiProperty()
    isActive: boolean;

    @ApiProperty()
    createdAt: Date;
}

export class PaginatedUsersResponseDto extends createPaginatedResponseDto(UserListItemDto) {}
