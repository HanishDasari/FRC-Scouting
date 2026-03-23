import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, username, password } = body;

    const cookieStore = await cookies();

    if (action === 'logout') {
      cookieStore.delete('admin_token');
      return NextResponse.json({ success: true });
    }

    if (action === 'login') {
      const validUsername = process.env.ADMIN_USERNAME || 'Raiders6905Admin';
      const validPassword = process.env.ADMIN_PASSWORD || 'Str@tegy$cout!2026';

      if (username === validUsername && password === validPassword) {
        cookieStore.set('admin_token', 'true', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
          maxAge: 60 * 60 * 24 * 7 // 1 week
        });
        return NextResponse.json({ success: true });
      } else {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
