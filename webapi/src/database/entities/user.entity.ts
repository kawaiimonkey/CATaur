import { Entity, Column, PrimaryColumn, CreateDateColumn, Index, OneToMany } from 'typeorm';
import { UserRole } from './user-role.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class User {
    @ApiProperty({ description: 'The unique identifier of the user' })
    @PrimaryColumn('char', { length: 26 })
    id: string;



    @ApiProperty({ description: 'The email of the user' })
    @Index()
    @Column({ unique: true })
    email: string;

    @ApiProperty({ description: 'Whether the user is active' })
    @Column({ default: false })
    isActive: boolean;

    @ApiProperty({ description: 'The password hash of the user' })
    @Column({ nullable: false })
    passwordHash: string;

    @ApiProperty({ description: 'Last login time', nullable: true })
    @Column({ type: 'datetime', nullable: true })
    lastLoginAt: Date | null;

    @ApiProperty({ description: 'Whether TOTP MFA is enabled', default: false })
    @Column({ default: false })
    totpEnabled: boolean;

    @ApiProperty({ description: 'Encrypted TOTP secret', nullable: true })
    @Column({ type: 'text', nullable: true })
    totpSecretEnc: string | null;

    @ApiProperty({ description: 'TOTP verification time', nullable: true })
    @Column({ type: 'datetime', nullable: true })
    totpVerifiedAt: Date | null;

    @ApiProperty({ description: 'The date the user was created' })
    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(() => UserRole, (userRole) => userRole.user, { cascade: true })
    roles: UserRole[];
}
