import { Entity, Column, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Company {
    @PrimaryColumn('char', { length: 26 })
    id: string;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column({ nullable: true })
    contact: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    website: string;

    @Column({ nullable: true })
    location: string;

    @Column({ type: 'text', nullable: true })
    keyTechnologies: string;

    @ManyToOne(() => User, user => user.companies, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'clientId' })
    client: User;

    @Column({ type: 'char', length: 26, nullable: true })
    clientId: string | null;

    @CreateDateColumn()
    createdAt: Date;
}
