import nodemailer from "nodemailer";
import crypto from "crypto";

/**
 * Creates and returns a Nodemailer transporter.
 * Supports standard SMTP (e.g. Gmail / Brevo / SendGrid / Custom SMTP)
 */
const createTransporter = () => {
  const host = process.env.SMTP_HOST || process.env.GMAIL_HOST;
  const port = parseInt(process.env.SMTP_PORT || process.env.GMAIL_PORT || "587");
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_PASS;

  if (user && pass) {
    if (host) {
      return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    }

    // Default to Gmail service if host not explicitly provided
    return nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
  }

  return null;
};

/**
 * Send an email with HTML & plain text content.
 * Gracefully falls back to console output if SMTP credentials are not configured in dev mode.
 */
export const sendEmail = async ({ email, subject, html, text }) => {
  const fromName = process.env.EMAIL_FROM_NAME || "Bharat Swasthya AI";
  const fromAddress = process.env.EMAIL_FROM || process.env.GMAIL_USER || "no-reply@bharatswasthya.gov.in";

  const transporter = createTransporter();

  if (!transporter) {
    console.log("\n==================== 📧 DEV MAIL SERVICE (NO SMTP CONFIGURED) ====================");
    console.log(`To: ${email}`);
    console.log(`Subject: ${subject}`);
    console.log(`From: "${fromName}" <${fromAddress}>`);
    if (text) console.log(`Text Body:\n${text}`);
    console.log("===================================================================================\n");
    return { devFallback: true, sent: true };
  }

  try {
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to: email,
      subject,
      text: text || "Please view this email in an HTML-compatible client.",
      html,
    });

    console.log(`✅ Email sent successfully to ${email} (MessageID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to dispatch email to ${email}:`, error.message);
    // In development mode, don't crash the request if SMTP fails
    if (process.env.NODE_ENV !== "production") {
      console.warn("⚠️ Continuing request despite SMTP failure (Development Mode).");
      return { devFallback: true, sent: false, error: error.message };
    }
    throw error;
  }
};

/**
 * HTML Template for Account Email Verification
 */
export const registerEmailTemplate = (name, verifyUrl, token) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
    .card { max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #0d9488, #059669); padding: 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { margin: 4px 0 0 0; font-size: 13px; opacity: 0.9; }
    .body { padding: 28px 24px; color: #334155; line-height: 1.6; }
    .btn { display: inline-block; background-color: #0d9488; color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 10px; margin: 20px 0; text-align: center; }
    .token-box { background: #f1f5f9; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 12px; font-family: monospace; font-size: 15px; font-weight: 700; color: #0f172a; word-break: break-all; margin: 12px 0; text-align: center; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>Bharat Swasthya AI</h1>
      <p>National Epidemiological Outbreak Intelligence Platform</p>
    </div>
    <div class="body">
      <h2 style="font-size: 18px; color: #0f172a; margin-top: 0;">Welcome, ${name}!</h2>
      <p>Thank you for registering on <strong>Bharat Swasthya AI</strong>. Please verify your email address to activate your citizen health account and access health advisories, symptom checkers, and emergency resources.</p>
      
      <div style="text-align: center;">
        <a href="${verifyUrl}" class="btn">Verify My Account</a>
      </div>

      <p style="font-size: 13px; color: #64748b;">Or enter this direct verification code in the portal:</p>
      <div class="token-box">${token}</div>

      <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">This verification link will expire in 24 hours. If you did not sign up for this account, please disregard this email.</p>
    </div>
    <div class="footer">
      &copy; 2026 Bharat Swasthya AI • Ministry of Health & Family Welfare
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * HTML Template for Password Reset
 */
export const forgotPasswordEmailTemplate = (name, resetUrl, token) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
    .card { max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #0284c7, #0369a1); padding: 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
    .header p { margin: 4px 0 0 0; font-size: 13px; opacity: 0.9; }
    .body { padding: 28px 24px; color: #334155; line-height: 1.6; }
    .btn { display: inline-block; background-color: #0284c7; color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 10px; margin: 20px 0; text-align: center; }
    .token-box { background: #f1f5f9; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 12px; font-family: monospace; font-size: 15px; font-weight: 700; color: #0f172a; word-break: break-all; margin: 12px 0; text-align: center; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>Bharat Swasthya AI</h1>
      <p>Password Reset Request</p>
    </div>
    <div class="body">
      <h2 style="font-size: 18px; color: #0f172a; margin-top: 0;">Hello ${name},</h2>
      <p>We received a request to reset the password associated with your Bharat Swasthya AI account. Click the button below to set a new password:</p>
      
      <div style="text-align: center;">
        <a href="${resetUrl}" class="btn">Reset Password</a>
      </div>

      <p style="font-size: 13px; color: #64748b;">Or use this password reset token directly in the app:</p>
      <div class="token-box">${token}</div>

      <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">This link is valid for 1 hour. If you did not request a password reset, you can safely ignore this email.</p>
    </div>
    <div class="footer">
      &copy; 2026 Bharat Swasthya AI • Secure Healthcare Access
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * HTML Template for Staff Welcome Credentials (Doctor/Health Assistant created by Admin or Doctor)
 */
export const welcomeStaffEmailTemplate = (name, email, role, tempPassword) => {
  const roleDisplay = role === "doctor" ? "Medical Doctor (Reviewing Officer)" : "Health Assistant (ASHA Field Worker)";
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
    .card { max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #4f46e5, #4338ca); padding: 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
    .body { padding: 28px 24px; color: #334155; line-height: 1.6; }
    .info-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    .info-table td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
    .info-label { font-weight: 600; color: #64748b; width: 35%; }
    .info-val { font-weight: 600; color: #0f172a; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>Bharat Swasthya AI</h1>
      <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Staff Account Provisioning</p>
    </div>
    <div class="body">
      <h2 style="font-size: 18px; color: #0f172a; margin-top: 0;">Welcome, ${name}!</h2>
      <p>An official staff account has been provisioned for you on the <strong>Bharat Swasthya AI</strong> National Surveillance Platform.</p>
      
      <table class="info-table">
        <tr>
          <td class="info-label">Assigned Role:</td>
          <td class="info-val">${roleDisplay}</td>
        </tr>
        <tr>
          <td class="info-label">Login Email:</td>
          <td class="info-val">${email}</td>
        </tr>
        <tr>
          <td class="info-label">Initial Password:</td>
          <td class="info-val" style="font-family: monospace;">${tempPassword}</td>
        </tr>
      </table>

      <p style="font-size: 13px; color: #64748b;">Please sign in to the portal using these credentials and update your password immediately.</p>
    </div>
    <div class="footer">
      &copy; 2026 Bharat Swasthya AI • Official Healthcare Staff Network
    </div>
  </div>
</body>
</html>
  `;
};
