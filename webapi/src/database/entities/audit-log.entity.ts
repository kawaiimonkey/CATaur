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
    route: string;

    @Column({ nullable: true })
    httpMethod: string;

    @Column({ nullable: true })
    httpStatusCode: number;

    @Column()
    actionType: string;

    @Column({ type: 'json', nullable: true })
    actionDetails: any;

    @Column({ type: 'json', nullable: true })
    httpRequestBody: any;

    @Column({ nullable: true })
    ipAddress: string;

    @CreateDateColumn()
    createdAt: Date;
}
