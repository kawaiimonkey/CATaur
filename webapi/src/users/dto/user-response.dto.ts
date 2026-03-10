import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
    @ApiProperty({ example: '01HZX6E0PX9M2NQBP9F6M3KQ5A' })
    id: string;

    @ApiProperty({ example: 'user@example.com' })
    email: string;

    @ApiProperty({ example: true })
    isActive: boolean;

    @ApiProperty()
    createdAt: Date;
}
