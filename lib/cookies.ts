'use server';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = cookies();

  (await cookieStore).set('accessToken', accessToken, {
    httpOnly: true,
    secure: true,
    path: '/',
    maxAge: 60 * 15, // 15 minutes
    sameSite: 'strict',
  });

  (await cookieStore).set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'strict',
  });

  return NextResponse.json({ success: true });
}

export async function clearAuthCookies() {
  const cookieStore = cookies();
  (await cookieStore).delete('accessToken');
   (await cookieStore).delete('refreshToken');

  return NextResponse.json({ cleared: true });
}
