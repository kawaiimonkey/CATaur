import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);

    async sendVerificationEmail(email: string, token: string): Promise<void> {
        const verificationLink = `http://localhost:3000/auth/verify?token=${token}`;

        // In a real application, you would use a library like nodemailer or an external service
        this.logger.log(`Sending verification email to ${email}`);
        this.logger.log(`Verification link: ${verificationLink}`);

        // Mock sending delay
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}
