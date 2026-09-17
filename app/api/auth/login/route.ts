import { NextResponse } from 'next/server';
import { getUserByEmail, verifyPassword, addLog } from '@/shared/utils/db';
import { signSession } from '@/shared/utils/session';

const ALLOWED_DOMAINS = ['takeoutmedia.xyz', 'tmlabs.xyz'];

function validateEmail(email: string): boolean {
  const normalized = email.toLowerCase().trim();
  const domain = normalized.split('@')[1];
  return ALLOWED_DOMAINS.includes(domain);
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { email?: string; password?: string };
    const { email, password } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!validateEmail(normalizedEmail)) {
      return NextResponse.json({
        error: 'Access is restricted to @takeoutmedia.xyz and @tmlabs.xyz domains only.'
      }, { status: 403 });
    }

    // 1. Fetch user from Local DB
    const user = await getUserByEmail(normalizedEmail);

    if (!user) {
      return NextResponse.json({
        error: 'No account found with this email address. Please contact your administrator or verify your email.'
      }, { status: 404 });
    }

    if (user.status === 'deactivated') {
      return NextResponse.json({
        error: 'Your account has been deactivated. Please contact your administrator.'
      }, { status: 403 });
    }

    // 2. Check if user has a password set up
    const hasLocalPassword = !!(user.passwordHash && user.passwordSalt);

    if (!hasLocalPassword) {
      // User is either newly invited or an existing member who has not set a password yet
      return NextResponse.json({
        requiresPasswordSetup: true,
        message: 'You have not set up a password yet. Please verify your email with a one-time code to create your password.'
      }, { status: 200 });
    }

    // 3. User has a password — validate the provided password
    if (!password || !password.trim()) {
      return NextResponse.json({
        error: 'Please enter your password to sign in.'
      }, { status: 400 });
    }

    let isPasswordValid = false;

    // Check password hash
    if (user.passwordHash && user.passwordSalt) {
      isPasswordValid = verifyPassword(password.trim(), user.passwordHash, user.passwordSalt);
    }

    if (!isPasswordValid) {
      return NextResponse.json({
        error: 'Invalid password. Please check your credentials or click "Forgot password?" to reset.'
      }, { status: 401 });
    }

    // 4. Password is correct — Log the user in directly (NO OTP REQUIRED)
    const logId = await addLog(normalizedEmail);
    const maxAge = 24 * 60 * 60; // 24 hours
    const expiresAt = Date.now() + maxAge * 1000;

    const token = await signSession({
      email: normalizedEmail,
      logId,
      expiresAt,
      role: user.role
    });

    const response = NextResponse.json({
      success: true,
      email: normalizedEmail,
      role: user.role,
      fullName: user.fullName
    });

    response.cookies.set({
      name: 'session_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: maxAge,
    });

    return response;
  } catch (error: any) {
    console.error('Password Login API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
