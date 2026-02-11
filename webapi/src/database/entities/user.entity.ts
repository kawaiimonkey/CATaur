import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class User {
    @ApiProperty({ description: 'The unique identifier of the user' })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ description: 'The username of the user' })
    @Column({ unique: true })
    username: string;

    @ApiProperty({ description: 'The password of the user' })
    @Column()
    password: string;

    @ApiProperty({ description: 'The email of the user' })
    @Column({ unique: true })
    email: string;

    @ApiProperty({ description: 'Whether the user is active' })
    @Column({ default: true })
    isActive: boolean;

    @ApiProperty({ description: 'The date the user was created' })
    @CreateDateColumn()
    createdAt: Date;
}
