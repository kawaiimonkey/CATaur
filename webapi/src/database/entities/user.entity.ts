import { Entity, Column, PrimaryColumn, CreateDateColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class User {
    @ApiProperty({ description: 'The unique identifier of the user' })
    @PrimaryColumn('char', { length: 26 })
    id: string;



    @ApiProperty({ description: 'The email of the user' })
    @Index()
    @Column({ unique: true })
    email: string;

    @ApiProperty({ description: 'Whether the user is active' })
    @Column({ default: false })
    isActive: boolean;

    @ApiProperty({ description: 'The date the user was created' })
    @CreateDateColumn()
    createdAt: Date;
}
