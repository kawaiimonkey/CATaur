import { Entity, Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class SystemConfig {
    @ApiProperty()
    @PrimaryColumn()
    key: string;

    @ApiProperty({ required: false, type: String })
    @Column({ type: 'text', nullable: true })
    value: string;

    @ApiProperty()
    @Column()
    category: string;

    @ApiProperty()
    @UpdateDateColumn()
    updatedAt: Date;
}
