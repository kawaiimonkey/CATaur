import { Entity, Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class SystemConfig {
    @PrimaryColumn()
    key: string;

    @Column({ type: 'text', nullable: true })
    value: string;

    @Column()
    category: string;

    @UpdateDateColumn()
    updatedAt: Date;
}
