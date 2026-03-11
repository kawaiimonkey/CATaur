import { Entity, Column, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Candidate } from './candidate.entity';
import { ApiProperty } from '@nestjs/swagger';

export type ResumeParserStatus = 'parsed' | 'applied' | 'superseded' | 'failed';

@Entity()
export class ResumeParser {
    @ApiProperty()
    @PrimaryColumn('char', { length: 26 })
    id: string;

    @ApiProperty()
    @Column('char', { length: 26 })
    candidateId: string;

    @ManyToOne(() => Candidate, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'candidateId' })
    candidate: Candidate;

    @ApiProperty({ required: false, type: String })
    @Column({ type: 'varchar', length: 500, nullable: true })
    resumeUrl: string | null;

    @ApiProperty({ required: false, type: String })
    @Column({ type: 'longblob', nullable: true })
    parsedData: Buffer | string | null;

    @ApiProperty({ required: false, type: String })
    @Column({ type: 'longtext', nullable: true })
    rawTextPreview: string | null;

    @ApiProperty({ type: [String], required: false })
    @Column({ type: 'json', nullable: true })
    warnings: string[] | null;

    @ApiProperty({ required: false, type: Number })
    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    confidence: number | null;

    @ApiProperty()
    @Column({ type: 'varchar', length: 50, default: 'parsed' })
    status: ResumeParserStatus;

    @ApiProperty()
    @CreateDateColumn()
    parseDate: Date;
}
