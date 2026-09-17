import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/shared/utils/session';
import { getUserByEmail, verifyPassword, setUserPassword } from '@/shared/utils/db';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const session = await verifySession(token);
    if (!session || !session.email) {
      return NextResponse.json({ error: 'Session expired. Please log in again.' }, { status: 401 });
    }

    const body = await request.json() as { currentPassword?: string; newPassword?: string };
    const { currentPassword, newPassword } = body;

    if (!newPassword || newPassword.trim().length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters long.' }, { status: 400 });
    }

    const user = await getUserByEmail(session.email);
    if (!user) {
      return NextResponse.json({ error: 'User account not found.' }, { status: 404 });
    }

    // If user already has a password set, verify current password
    if (user.passwordHash && user.passwordSalt) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Please enter your current password.' }, { status: 400 });
      }

      const isCurrentValid = verifyPassword(currentPassword.trim(), user.passwordHash, user.passwordSalt);
      if (!isCurrentValid) {
        return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });
      }
    }

    // Update password in MongoDB Atlas
    await setUserPassword(session.email, newPassword.trim());

    return NextResponse.json({ 
      success: true, 
      message: 'Your password has been changed successfully!' 
    });
  } catch (error: any) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
