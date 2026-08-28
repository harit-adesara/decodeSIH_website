import Mailgen from "mailgen";
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

/**
 * Initialize Google OAuth2 Client for Gmail API
 */
const getOAuth2Client = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  return oauth2Client;
};

/**
 * Configure Mailgen Branding for Bharat Swasthya AI
 */
const mailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "Bharat Swasthya AI",
    link: process.env.CLIENT_URL || "https://bharatswasthya.gov.in",
  },
});

/**
 * Send email using Google Gmail API (OAuth2)
 * Supports both Mailgen content objects and raw HTML / Text templates.
 */
export const sendEmail = async (option) => {
  let emailHtml = "";
  let emailTextual = "";

  if (option.mailgenContent) {
    emailTextual = mailGenerator.generatePlaintext(option.mailgenContent);
    emailHtml = mailGenerator.generate(option.mailgenContent);
  } else {
    emailHtml = option.html || "";
    emailTextual = option.text || "Please view this email in an HTML-compatible client.";
  }

  const fromSender = process.env.GMAIL_USER || "no-reply@bharatswasthya.gov.in";
  const fromName = process.env.EMAIL_FROM_NAME || "Bharat Swasthya AI";

  const message = [
    `From: "${fromName}" <${fromSender}>`,
    `To: ${option.email}`,
    `Subject: ${option.subject}`,
    "MIME-Version: 1.0",
    "Content-Type: multipart/alternative; boundary=boundary123",
    "",
    "--boundary123",
    "Content-Type: text/plain; charset=UTF-8",
    "",
    emailTextual,
    "",
    "--boundary123",
    "Content-Type: text/html; charset=UTF-8",
    "",
    emailHtml,
    "",
    "--boundary123--",
  ].join("\n");

  const encodedMessage = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const oauth2Client = getOAuth2Client();

  if (!oauth2Client) {
    if (process.env.NODE_ENV !== "production") {
      console.log("\n==================== 📧 DEV MAIL SERVICE (NO GOOGLE API CONFIGURED) ====================");
      console.log(`To: ${option.email}`);
      console.log(`Subject: ${option.subject}`);
      if (emailTextual) console.log(`Text Preview:\n${emailTextual.slice(0, 300)}...`);
      console.log("=========================================================================================\n");
      return { devFallback: true, sent: true };
    }
    throw new Error(
      "Google OAuth2 credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN) are missing in production."
    );
  }

  try {
    const gmail = google.gmail({
      version: "v1",
      auth: oauth2Client,
    });

    const response = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
      },
    });

    console.log(`✅ Email sent successfully to ${option.email} via Google Gmail API (ID: ${response.data.id})`);
    return { success: true, messageId: response.data.id };
  } catch (error) {
    console.error(`❌ Google Gmail API Error for ${option.email}:`, error.message);
    if (process.env.NODE_ENV !== "production") {
      console.warn("⚠️ Continuing request despite Gmail API error (Development Mode).");
      return { devFallback: true, sent: false, error: error.message };
    }
    throw error;
  }
};

/**
 * Mailgen registration template helper
 */
export const registerEmail = (username, passwordSetUrl) => {
  return {
    body: {
      name: username,
      intro: "Welcome to Bharat Swasthya AI - National Outbreak Intelligence & Healthcare Platform.",
      action: {
        instructions: "To verify your account and activate your citizen health profile, please click below:",
        button: {
          color: "#0d9488",
          text: "Verify Account",
          link: passwordSetUrl,
        },
      },
      outro: "This verification link is valid for 24 hours. If you did not create this account, please disregard this email.",
    },
  };
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
 * Mailgen Forgot Password Content Helper
 */
export const forgotPasswordMailgenContent = (username, passwordResetUrl) => {
  return {
    body: {
      name: username,
      intro: "We received a request to reset the password of your Bharat Swasthya AI account.",
      action: {
        instructions: "To reset your password, click on the following button:",
        button: {
          color: "#0284c7",
          text: "Reset Password",
          link: passwordResetUrl,
        },
      },
      outro: "This reset link is valid for 1 hour. If you did not request a password reset, you can safely ignore this email.",
    },
  };
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
 * HTML Template for Staff Welcome Credentials
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
