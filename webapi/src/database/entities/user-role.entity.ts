import { Entity, Column, ManyToOne, JoinColumn, Index, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum Role {
    ADMIN = 'Admin',
    USER = 'User',
    CLIENT = 'Client',
    RECRUITER = 'Recruiter',
    CANDIDATE = 'Candidate',
}

@Entity()
@Index(['role']) // For efficient filtering by role
export class UserRole {
    @ApiProperty({ description: 'The user ID' })
    @PrimaryColumn('char', { length: 26 })
    userId: string;

    @ApiProperty({ description: 'The role of the user', enum: Role })
    @PrimaryColumn('varchar', { length: 50 })
    role: Role;

    @ManyToOne(() => User, (user) => user.roles, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;
}
