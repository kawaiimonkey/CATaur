import { Entity, Column, ManyToOne, JoinColumn, Index, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum Role {
    ADMIN = 'admin',
    USER = 'user',
    CLIENT = 'client',
    RECRUITER = 'recruiter',
}

@Entity()
@Index(['role']) // For efficient filtering by role
export class UserRole {
    @ApiProperty({ description: 'The user ID' })
    @PrimaryColumn({ length: 26 })
    userId: string;

    @ApiProperty({ description: 'The role of the user', enum: Role })
    @PrimaryColumn()
    role: Role;

    @ManyToOne(() => User, (user) => user.roles, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;
}
