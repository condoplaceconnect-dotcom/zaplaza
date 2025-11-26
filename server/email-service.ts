/**
 * @fileoverview Email Service to handle sending verification emails.
 * In a real-world scenario, this would integrate with a real email provider
 * like SendGrid, Mailgun, or AWS SES.
 * For this project, we'll use a "fake" service that logs the link to the console.
 */

const APP_BASE_URL = process.env.VITE_APP_URL || 'http://localhost:3000';

interface EmailService {
  sendVerificationEmail(email: string, token: string): Promise<void>;
}

/**
 * FakeEmailService simulates sending emails by logging the content to the console.
 * This is useful for development and testing without setting up a real email provider.
 */
class FakeEmailService implements EmailService {
  async sendVerificationEmail(email: string, token: string): Promise<void> {
    // Construct the verification URL that the user will click
    const verificationUrl = `${APP_BASE_URL}/verify-email?token=${token}`;

    console.log('\n================================================================');
    console.log(' FAKE EMAIL SERVICE: Sending Verification Email ');
    console.log('================================================================');
    console.log(`=> To: ${email}`);
    console.log(`=> Subject: Verify Your Email for Zaplaza`);
    console.log(`=> Body: Please click the link below to verify your email address.`);
    console.log(`=> Verification Link: ${verificationUrl}`);
    console.log('================================================================\n');

    // In a real implementation, there would be no return value.
    // Here, we resolve the promise to simulate a successful send.
    return Promise.resolve();
  }
}

// Export a singleton instance of the email service.
export const emailService = new FakeEmailService();
