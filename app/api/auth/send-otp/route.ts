import { NextResponse } from 'next/server';
import { saveOTP } from '@/shared/utils/db';
import nodemailer from 'nodemailer';

const ALLOWED_DOMAINS = ['takeoutmedia.xyz', 'tmlabs.xyz'];

function validateEmail(email: string): boolean {
  const normalized = email.toLowerCase().trim();
  const domain = normalized.split('@')[1];
  return ALLOWED_DOMAINS.includes(domain);
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
console.log('Received email for OTP:', email);
    if (!email) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
    }

    if (!validateEmail(email)) {
      return NextResponse.json({
        error: 'Registration/Login is restricted to takeoutmedia.xyz and tmlabs.xyz domains only.'
      }, { status: 403 });
    }

    // Generate 6-digit OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    await saveOTP(email, code, expiresAt);

    // Check if SMTP is configured (ignoring placeholders)
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
    
    const smtpPlaceholders = [
      'smtp.your-provider.com',
      'your-smtp-username',
      'your-smtp-password'
    ];
    
    const isSMTPConfigured = !!(
      SMTP_HOST && !smtpPlaceholders.some(p => SMTP_HOST.includes(p)) &&
      SMTP_PORT &&
      SMTP_USER && !smtpPlaceholders.some(p => SMTP_USER.includes(p)) &&
      SMTP_PASS && !smtpPlaceholders.some(p => SMTP_PASS.includes(p)) &&
      SMTP_FROM
    );

    if (isSMTPConfigured) {
      try {
        const transporter = nodemailer.createTransport({
          host: SMTP_HOST,
          port: parseInt(SMTP_PORT || '587'),
          secure: parseInt(SMTP_PORT || '587') === 465,
          auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
          },
        });

        const htmlTemplate = `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 25px;">
              <div style="display: inline-block; width: 40px; height: 40px; border-radius: 8px; background: linear-gradient(135deg, #FF3396, #8B5CF6); margin-bottom: 10px;"></div>
              <h2 style="margin: 0; color: #0f172a; font-size: 24px; font-weight: 700;">TM Labs Dashboard</h2>
            </div>
            <p style="color: #475569; font-size: 15px; line-height: 1.5; margin-bottom: 20px;">Hello,</p>
            <p style="color: #475569; font-size: 15px; line-height: 1.5; margin-bottom: 20px;">Use the following One-Time Password (OTP) to securely sign in to your TM Labs account. This code is valid for <strong>5 minutes</strong>.</p>
            <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; text-align: center; margin-bottom: 25px;">
              <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #ff3396; font-family: monospace;">${code}</span>
            </div>
            <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; text-align: center; margin-top: 30px; border-top: 1px solid #f1f5f9; padding-top: 20px;">
              If you did not request this code, you can safely ignore this email.
            </p>
          </div>
        `;

        await transporter.sendMail({
          from: SMTP_FROM,
          to: email.toLowerCase().trim(),
          subject: `🔐 TM Labs Security Code: ${code}`,
          text: `Your TM Labs security OTP is ${code}. It expires in 5 minutes.`,
          html: htmlTemplate,
        });

        return NextResponse.json({ success: true, devMode: false });
      } catch (smtpError: any) {
        console.error('SMTP sending failed, falling back to local Dev Mode:', smtpError);
        // Fallback to dev mode so it doesn't block the user
        return NextResponse.json({ 
          success: true, 
          devMode: true, 
          code, 
          warning: 'SMTP sending failed. Rendered OTP in fallback mode.' 
        });
      }
    } else {
      // Dev/Mock Mode: Log to console and return the code in response
      console.log(`\n==============================================`);
      console.log(`🔐 [TM Labs Auth Service] DEV MODE ACTIVE`);
      console.log(`📧 OTP for email: ${email.toLowerCase().trim()}`);
      console.log(`🔑 Verification Code: ${code}`);
      console.log(`==============================================\n`);

      return NextResponse.json({ success: true, devMode: true, code });
    }
  } catch (error: any) {
    console.error('Send OTP API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
