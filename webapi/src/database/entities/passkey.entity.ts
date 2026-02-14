import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Passkey {
    @PrimaryColumn()
    credentialID: string;

    @Column({ type: 'blob' })
    publicKey: Buffer;

    @Column()
    counter: number;

    @Column('char', { length: 26 })
    userId: string;

    @Column('simple-array', { nullable: true })
    transports: string[];

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;
}
