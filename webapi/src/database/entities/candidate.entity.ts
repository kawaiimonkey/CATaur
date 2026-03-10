import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Candidate {
    @PrimaryColumn('char', { length: 26 })
    id: string;

    @OneToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id' })
    user: User;

    @Column({ type: 'varchar', length: 500, nullable: true })
    resumeUrl: string | null;

    @Column({ type: 'varchar', length: 500, nullable: true })
    portfolioUrl: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    currentLocation: string | null;

    @Column({ type: 'int', nullable: true })
    noticePeriod: number | null;

    @Column({ type: 'date', nullable: true })
    availableDate: string | null;

    @Column({ type: 'varchar', length: 50, nullable: true })
    profileStatus: string | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
