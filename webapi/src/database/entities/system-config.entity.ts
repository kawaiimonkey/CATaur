import { Entity, Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class SystemConfig {
    @ApiProperty()
    @PrimaryColumn()
    key: string;

    @ApiProperty({ required: false, nullable: true })
    @Column({ type: 'text', nullable: true })
    value: string;

    @ApiProperty()
    @Column()
    category: string;

    @ApiProperty()
    @UpdateDateColumn()
    updatedAt: Date;
}
