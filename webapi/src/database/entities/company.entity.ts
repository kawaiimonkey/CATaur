import { Entity, Column, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Company {
    @ApiProperty()
    @PrimaryColumn('char', { length: 26 })
    id: string;

    @ApiProperty()
    @Column()
    name: string;

    @ApiProperty()
    @Column()
    email: string;

    @ApiProperty({ required: false, nullable: true })
    @Column({ nullable: true })
    contact: string;

    @ApiProperty({ required: false, nullable: true })
    @Column({ nullable: true })
    phone: string;

    @ApiProperty({ required: false, nullable: true })
    @Column({ nullable: true })
    website: string;

    @ApiProperty({ required: false, nullable: true })
    @Column({ nullable: true })
    location: string;

    @ApiProperty({ required: false, nullable: true })
    @Column({ type: 'text', nullable: true })
    keyTechnologies: string;

    @ManyToOne(() => User, user => user.companies, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'clientId' })
    client: User;

    @ApiProperty({ required: false, nullable: true })
    @Column({ type: 'char', length: 26, nullable: true })
    clientId: string | null;

    @ApiProperty()
    @CreateDateColumn()
    createdAt: Date;
}
