import {
    Entity,
    Column,
    PrimaryColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Company } from './company.entity';
import { ApiProperty } from '@nestjs/swagger';

export type JobOrderStatus = 'sourcing' | 'interview' | 'offer' | 'filled' | 'paused';
export type JobOrderPriority = 'high' | 'medium' | 'low';

@Entity()
export class JobOrder {
    @ApiProperty()
    @PrimaryColumn('char', { length: 26 })
    id: string;

    @ApiProperty()
    @Column({ type: 'varchar', length: 255 })
    title: string;

    @ApiProperty({ required: false })
    @Column({ type: 'text', nullable: true })
    description: string | null;

    @ApiProperty()
    @Column({
        type: 'varchar',
        length: 20,
        default: 'sourcing',
    })
    status: JobOrderStatus;

    @ApiProperty()
    @Column({
        type: 'varchar',
        length: 10,
        default: 'medium',
    })
    priority: JobOrderPriority;

    @ApiProperty({ required: false })
    @Column({ type: 'varchar', length: 255, nullable: true })
    location: string | null;

    @ApiProperty()
    @Column({ type: 'int', default: 1 })
    openings: number;

    @ApiProperty({ required: false })
    @Column({ type: 'varchar', length: 100, nullable: true })
    salary: string | null;

    /** JSON array of tag strings, e.g. ["Go", "PostgreSQL"] */
    @ApiProperty({ required: false })
    @Column({ type: 'simple-json', nullable: true })
    tags: string[] | null;

    // ── Relations ──────────────────────────────────────────
    @Column({ type: 'char', length: 26, nullable: true })
    companyId: string | null;

    @ManyToOne(() => Company, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'companyId' })
    company: Company;

    /** The recruiter who owns this job order */
    @Column({ type: 'char', length: 26, nullable: true })
    assignedToId: string | null;

    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'assignedToId' })
    assignedTo: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
