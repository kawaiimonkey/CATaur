import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Candidate {
    @ApiProperty()
    @PrimaryColumn('char', { length: 26 })
    id: string;

    @OneToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id' })
    user: User;

    @ApiProperty({ required: false, nullable: true })
    @Column({ type: 'varchar', length: 500, nullable: true })
    resumeUrl: string | null;

    @ApiProperty({ required: false, nullable: true })
    @Column({ type: 'varchar', length: 500, nullable: true })
    portfolioUrl: string | null;

    @ApiProperty({ required: false, nullable: true })
    @Column({ type: 'varchar', length: 255, nullable: true })
    currentLocation: string | null;

    @ApiProperty({ required: false, nullable: true })
    @Column({ type: 'int', nullable: true })
    noticePeriod: number | null;

    @ApiProperty({ required: false, nullable: true })
    @Column({ type: 'date', nullable: true })
    availableDate: string | null;

    @ApiProperty({ required: false, nullable: true })
    @Column({ type: 'varchar', length: 50, nullable: true })
    profileStatus: string | null;

    @ApiProperty()
    @CreateDateColumn()
    createdAt: Date;

    @ApiProperty()
    @UpdateDateColumn()
    updatedAt: Date;
}
