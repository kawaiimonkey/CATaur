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
}
