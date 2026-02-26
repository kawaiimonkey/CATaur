import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private transporter: nodemailer.Transporter;

    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get<string>('SMTP_HOST'),
            port: Number(this.configService.get<number>('SMTP_PORT')),
            secure: Number(this.configService.get<number>('SMTP_PORT')) === 465,
            auth: {
                user: this.configService.get<string>('EMAIL_USER'),
                pass: this.configService.get<string>('EMAIL_PASS'),
            },
        });
    }

    async sendVerificationEmail(email: string, token: string): Promise<void> {
        const verificationLink = `${this.configService.get<string>('WEBAUTHN_ORIGIN')}/auth/verify?token=${token}`;

        const mailOptions = {
            from: this.configService.get<string>('EMAIL_FROM'),
            to: email,
            subject: 'Verify Your Email - CATaur',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #333;">Welcome to CATaur</h2>
                    <p style="color: #555;">Please click the button below to verify your email and complete your registration:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
                    </div>
                    <p style="color: #777; font-size: 12px;">Or copy and paste this link into your browser:</p>
                    <p style="color: #777; font-size: 12px;"><a href="${verificationLink}">${verificationLink}</a></p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #999; font-size: 11px;">If you did not request this email, please ignore it.</p>
                </div>
            `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            this.logger.log(`Verification email sent to ${email}`);
        } catch (error) {
            this.logger.error(`Failed to send verification email to ${email}: ${error.message}`);
            throw error;
        }
    }

    async sendVerificationCodeEmail(email: string, code: string): Promise<void> {
        const mailOptions = {
            from: this.configService.get<string>('EMAIL_FROM'),
            to: email,
            subject: 'Your Login Verification Code - CATaur',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #333;">Verification Code</h2>
                    <p style="color: #555;">Use the following code to login to your CATaur account. This code will expire in 5 minutes.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; font-size: 32px; font-weight: bold; color: #4CAF50; letter-spacing: 5px;">
                            ${code}
                        </div>
                    </div>
                    <p style="color: #777; font-size: 12px;">If you did not request this code, please ignore this email. Do not share this code with anyone.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #999; font-size: 11px;">CATaur Security Team</p>
                </div>
            `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            this.logger.log(`Verification code email sent to ${email}`);
        } catch (error) {
            this.logger.error(`Failed to send verification code email to ${email}: ${error.message}`);
            throw error;
        }
    }

    async sendPasswordResetEmail(email: string, resetLink: string): Promise<void> {
        const mailOptions = {
            from: this.configService.get<string>('EMAIL_FROM'),
            to: email,
            subject: 'Reset Your Password - CATaur',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #333;">Password Reset Request</h2>
                    <p style="color: #555;">Click the button below to reset your password. This link will expire in 30 minutes.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" style="background-color: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
                    </div>
                    <p style="color: #777; font-size: 12px;">Or copy and paste this link into your browser:</p>
                    <p style="color: #777; font-size: 12px;"><a href="${resetLink}">${resetLink}</a></p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #999; font-size: 11px;">If you did not request this email, please ignore it. Your password will not change without a valid reset link.</p>
                </div>
            `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            this.logger.log(`Password reset email sent to ${email}`);
        } catch (error) {
            this.logger.error(`Failed to send password reset email to ${email}: ${error.message}`);
            throw error;
        }
    }

    async sendPasswordChangedNotification(email: string): Promise<void> {
        const mailOptions = {
            from: this.configService.get<string>('EMAIL_FROM'),
            to: email,
            subject: 'Your Password Has Been Changed - CATaur',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #333;">Password Changed</h2>
                    <p style="color: #555;">Your password has been successfully changed. If you did not make this change, please contact our support team immediately.</p>
                    <div style="margin: 20px 0; padding: 10px; background-color: #fff3cd; border-left: 4px solid #ffc107;">
                        <p style="color: #856404; margin: 0;">❗ If this was not you, click <a href="${this.configService.get<string>('WEBAUTHN_ORIGIN')}/auth/request-password-reset">here</a> to secure your account.</p>
                    </div>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #999; font-size: 11px;">CATaur Security Team</p>
                </div>
            `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            this.logger.log(`Password change notification sent to ${email}`);
        } catch (error) {
            this.logger.error(`Failed to send password change notification to ${email}: ${error.message}`);
            throw error;
        }
    }
}
