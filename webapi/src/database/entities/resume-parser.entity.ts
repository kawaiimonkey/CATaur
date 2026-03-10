import { Entity, Column, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Candidate } from './candidate.entity';

export type ResumeParserStatus = 'parsed' | 'applied' | 'superseded' | 'failed';

@Entity()
export class ResumeParser {
    @PrimaryColumn('char', { length: 26 })
    id: string;

    @Column('char', { length: 26 })
    candidateId: string;

    @ManyToOne(() => Candidate, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'candidateId' })
    candidate: Candidate;

    @Column({ type: 'varchar', length: 500, nullable: true })
    resumeUrl: string | null;

    @Column({ type: 'longblob', nullable: true })
    parsedData: Buffer | null;

    @Column({ type: 'longtext', nullable: true })
    rawTextPreview: string | null;

    @Column({ type: 'json', nullable: true })
    warnings: string[] | null;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    confidence: number | null;

    @Column({ type: 'varchar', length: 50, default: 'parsed' })
    status: ResumeParserStatus;

    @CreateDateColumn()
    parseDate: Date;
}
