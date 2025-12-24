import nodemailer from "nodemailer";
import emailConfig from "../config/email.js";
import logger from "../utils/logger.js";

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport(emailConfig);
    this.verifyConnection();
  }

  verifyConnection() {
    this.transporter.verify((error, success) => {
      if (error) {
        logger.error(`Error verifying connection: ${error}`);
      } else {
        logger.info(`Connection verified successfully ${success}`);
      }
    });
  }

  async sendEmail(options) {
    const mailOptions = {
      from: emailConfig.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    const info = await this.transporter.sendMail(mailOptions);
    logger.info(`📧 Email sent to ${options.to}: ${info.messageId}`);
    return info;
  }

  async sendVerificationEmail(user, verificationToken) {
    const verificationUrl = `http://localhost:5173/verify-email?token=${verificationToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: #667eea;
            color: white !important;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 12px;
          }
          .code {
            background: #e8e8e8;
            padding: 15px;
            border-radius: 5px;
            font-family: monospace;
            margin: 20px 0;
            word-break: break-all;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Welcome to Content Platform! 🎉</h1>
        </div>
        <div class="content">
          <p>Hi there,</p>
          <p>Thank you for registering! We're excited to have you on board.</p>
          <p>To complete your registration and verify your email address, please click the button below:</p>
          
          <center>
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
          </center>

          <p>Or copy and paste this link into your browser:</p>
          <div class="code">${verificationUrl}</div>

          <p><strong>⏰ This link will expire in 24 hours.</strong></p>

          <p>If you didn't create an account, you can safely ignore this email.</p>

          <div class="footer">
            <p>© 2025 Content Platform. All rights reserved.</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Welcome to Content Platform!

      Thank you for registering. Please verify your email by clicking this link:
      ${verificationUrl}

      This link will expire in 24 hours.

      If you didn't create an account, you can safely ignore this email.
    `;

    return this.sendEmail({
      to: user.email,
      subject: "Verify Your Email - Content Platform",
      html,
      text,
    });
  }

  async sendWelcomeEmail(user) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .feature {
            padding: 10px 0;
          }
          .feature-icon {
            font-size: 24px;
            margin-right: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎉 Email Verified!</h1>
        </div>
        <div class="content">
          <p>Hi ${user.email},</p>
          <p><strong>Congratulations!</strong> Your email has been successfully verified.</p>
          
          <p>You now have full access to Content Platform. Here's what you can do:</p>

          <div class="feature">
            <span class="feature-icon">✍️</span> Create and publish content
          </div>
          <div class="feature">
            <span class="feature-icon">💬</span> Comment and engage with posts
          </div>
          <div class="feature">
            <span class="feature-icon">🤖</span> Get AI-powered recommendations
          </div>
          <div class="feature">
            <span class="feature-icon">🔔</span> Receive real-time notifications
          </div>

          <p>Ready to get started? Log in to your account and explore!</p>

          <p>If you have any questions, feel free to reach out to our support team.</p>

          <p>Best regards,<br>The Content Platform Team</p>
        </div>
      </body>
      </html>
    `;

    const text = `
      Congratulations! Your email has been successfully verified.

      You now have full access to Content Platform.

      Ready to get started? Log in to your account and explore!

      Best regards,
      The Content Platform Team
    `;

    return this.sendEmail({
      to: user.email,
      subject: "Welcome to Content Platform! 🎉",
      html,
      text,
    });
  }

  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: #f44336;
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: #f44336;
            color: white !important;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
          }
          .code {
            background: #e8e8e8;
            padding: 15px;
            border-radius: 5px;
            font-family: monospace;
            margin: 20px 0;
            word-break: break-all;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔐 Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Hi there,</p>
          <p>We received a request to reset your password for your Content Platform account.</p>
          
          <center>
            <a href="${resetUrl}" class="button">Reset Password</a>
          </center>

          <p>Or copy and paste this link into your browser:</p>
          <div class="code">${resetUrl}</div>

          <div class="warning">
            <strong>⚠️ Security Notice:</strong>
            <ul>
              <li>This link will expire in <strong>10 minutes</strong></li>
              <li>If you didn't request this, please ignore this email</li>
              <li>Your password remains secure</li>
            </ul>
          </div>

          <p>If you continue to have issues, contact our support team.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
      Password Reset Request

      We received a request to reset your password.

      Reset your password by clicking this link:
      ${resetUrl}

      This link will expire in 10 minutes.

      If you didn't request this, please ignore this email.
    `;

    return this.sendEmail({
      to: user.email,
      subject: "Password Reset Request - Content Platform",
      html,
      text,
    });
  }

  async resetPasswordSuccessful(user) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .feature {
            padding: 10px 0;
          }
          .feature-icon {
            font-size: 24px;
            margin-right: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎉 Password Reset Successful!</h1>
        </div>
        <div class="content">
          <p>Hi ${user.email},</p>
          <p><strong>Congratulations!</strong> Your password has been successfully reset.</p>
          
          <p>You can now log in to your account using your new password.</p>

          <p>Ready to get started? Log in to your account and explore!</p>

          <p>If you have any questions, feel free to reach out to our support team.</p>

          <p>Best regards,<br>The Content Platform Team</p>
        </div>
      </body>
      </html>
    `;

    const text = `
      Password Reset Successful!

      Your password has been successfully reset.

      You can now log in to your account using your new password.

      Ready to get started? Log in to your account and explore!

      Best regards,
      The Content Platform Team
    `;

    return this.sendEmail({
      to: user.email,
      subject: "Password Reset Successful - Content Platform",
      html,
      text,
    });
  }
}

export default new EmailService();
