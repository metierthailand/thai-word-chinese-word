import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"; // Default Resend test email

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  // If Resend is not configured, log in development mode
  if (!resend || !process.env.RESEND_API_KEY) {
    if (process.env.NODE_ENV === "development") {
      console.log("=".repeat(50));
      console.log("EMAIL (Development Mode - Resend not configured)");
      console.log("To:", options.to);
      console.log("Subject:", options.subject);
      console.log("HTML:", options.html);
      console.log("=".repeat(50));
      console.log("To enable email sending:");
      console.log("1. Install: npm install resend");
      console.log("2. Get API key from: https://resend.com/api-keys");
      console.log("3. Add to .env: RESEND_API_KEY=re_xxxxx");
      console.log("4. Add to .env: RESEND_FROM_EMAIL=noreply@yourdomain.com");
      console.log("=".repeat(50));
    } else {
      console.error("RESEND_API_KEY is not configured. Email not sent.");
    }
    return;
  }

  try {
    await resend.emails.send({
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (process.env.NODE_ENV === "development") {
      console.log("✅ Email sent successfully to:", options.to);
    }
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}

export async function sendResetPasswordEmail(
  email: string,
  name: string,
  resetToken: string
): Promise<string> {
  const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password/${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb;">Welcome to The Trip!</h1>
          <p>Hello ${name},</p>
          <p>Your account has been created. Please set your password by clicking the link below:</p>
          <p style="margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Set Your Password
            </a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p style="margin-top: 30px; font-size: 12px; color: #666;">
            This link will expire in 24 hours. If you didn't request this, please ignore this email.
          </p>
        </div>
      </body>
    </html>
  `;

  const text = `
    Welcome to The Trip!
    
    Hello ${name},
    
    Your account has been created. Please set your password by visiting this link:
    ${resetUrl}
    
    This link will expire in 24 hours. If you didn't request this, please ignore this email.
  `;

  await sendEmail({
    to: email,
    subject: "Set Your Password - The Trip",
    html,
    text,
  });

  // In development mode, also log the reset URL for easy testing
  if (process.env.NODE_ENV === "development") {
    console.log("\n" + "=".repeat(70));
    console.log("🔗 RESET PASSWORD LINK (Development Mode)");
    console.log("=".repeat(70));
    console.log(`User: ${name} (${email})`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log(`Token: ${resetToken}`);
    console.log("=".repeat(70) + "\n");
  }

  // Return reset URL for development/testing purposes
  return resetUrl;
}

export async function sendEmailVerificationEmail(
  email: string,
  name: string,
  resetToken: string,
  newEmail: string
): Promise<string> {
  const verifyUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/verify-email/${resetToken}?email=${encodeURIComponent(newEmail)}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb;">Verify Your New Email Address</h1>
          <p>Hello ${name},</p>
          <p>You have requested to change your email address to <strong>${newEmail}</strong>.</p>
          <p>Please verify your new email address by clicking the link below:</p>
          <p style="margin: 30px 0;">
            <a href="${verifyUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Verify Email Address
            </a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verifyUrl}</p>
          <p style="margin-top: 30px; font-size: 12px; color: #666;">
            This link will expire in 24 hours. If you didn't request this change, please ignore this email.
          </p>
        </div>
      </body>
    </html>
  `;

  const text = `
    Verify Your New Email Address
    
    Hello ${name},
    
    You have requested to change your email address to ${newEmail}.
    
    Please verify your new email address by visiting this link:
    ${verifyUrl}
    
    This link will expire in 24 hours. If you didn't request this change, please ignore this email.
  `;

  await sendEmail({
    to: newEmail,
    subject: "Verify Your New Email Address - The Trip",
    html,
    text,
  });

  // In development mode, also log the verification URL for easy testing
  if (process.env.NODE_ENV === "development") {
    console.log("\n" + "=".repeat(70));
    console.log("🔗 EMAIL VERIFICATION LINK (Development Mode)");
    console.log("=".repeat(70));
    console.log(`User: ${name} (${email})`);
    console.log(`New Email: ${newEmail}`);
    console.log(`Verification URL: ${verifyUrl}`);
    console.log(`Token: ${resetToken}`);
    console.log("=".repeat(70) + "\n");
  }

  // Return verification URL for development/testing purposes
  return verifyUrl;
}

