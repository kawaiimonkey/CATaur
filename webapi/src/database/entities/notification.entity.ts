import {
    Entity,
    Column,
    PrimaryColumn,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Notification {
    @ApiProperty()
    @PrimaryColumn('char', { length: 26 })
    id: string;

    @Column({ type: 'char', length: 26 })
    userId: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @ApiProperty()
    @Column({ type: 'varchar', length: 100 })
    type: string;

    @ApiProperty()
    @Column({ type: 'varchar', length: 255 })
    title: string;

    @ApiProperty()
    @Column({ type: 'text' })
    body: string;

    @ApiProperty()
    @Column({ default: false })
    isRead: boolean;

    /** Optional reference ID (e.g. applicationId) */
    @ApiProperty({ required: false })
    @Column({ type: 'char', length: 26, nullable: true })
    refId: string | null;

    @CreateDateColumn()
    createdAt: Date;
}
