import { Entity, Column, PrimaryColumn, CreateDateColumn, Index } from 'typeorm';
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

    @ApiProperty({ description: 'The password hash of the user', nullable: true })
    @Column({ nullable: true })
    passwordHash: string;

    @ApiProperty({ description: 'Email verification code', nullable: true })
    @Column({ nullable: true })
    emailVerificationCode: string;

    @ApiProperty({ description: 'Email verification code expiry time', nullable: true })
    @Column({ type: 'datetime', nullable: true })
    emailVerificationCodeExpiry: Date;

    @ApiProperty({ description: 'Password reset token', nullable: true })
    @Column({ nullable: true })
    passwordResetToken: string;

    @ApiProperty({ description: 'Password reset token expiry time', nullable: true })
    @Column({ type: 'datetime', nullable: true })
    passwordResetTokenExpiry: Date;

    @ApiProperty({ description: 'Last login time', nullable: true })
    @Column({ type: 'datetime', nullable: true })
    lastLoginAt: Date;

    @ApiProperty({ description: 'The date the user was created' })
    @CreateDateColumn()
    createdAt: Date;
}
