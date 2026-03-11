import { Entity, Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class SystemConfig {
    @ApiProperty()
    @PrimaryColumn()
    key: string;

    @ApiProperty({ required: false, type: String })
    @Column({ type: 'longblob', nullable: true })
    value: Buffer | string | null;

    @ApiProperty()
    @Column()
    category: string;

    @ApiProperty()
    @UpdateDateColumn()
    updatedAt: Date;
}
