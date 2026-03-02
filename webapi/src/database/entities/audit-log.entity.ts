import { Entity, Column, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class AuditLog {
    @PrimaryColumn('char', { length: 26 })
    id: string;

    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'actorId' })
    actor: User;

    @Column({ type: 'char', length: 26, nullable: true })
    actorId: string | null;

    @Column({ nullable: true })
    targetId: string;

    @Column()
    actionType: string;

    @Column({ type: 'json', nullable: true })
    actionDetails: any;

    @CreateDateColumn()
    createdAt: Date;
}
