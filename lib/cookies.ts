'use server';

import { cookies } from 'next/headers';

export function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = cookies();

  cookieStore.set('accessToken', accessToken, {
    httpOnly: true,
    secure: true,
    path: '/',
    maxAge: 60 * 15, // 15 minutes
    sameSite: 'strict',
  });

  cookieStore.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'strict',
  });
}

export function clearAuthCookies() {
  const cookieStore = cookies();
  cookieStore.delete('accessToken');
  cookieStore.delete('refreshToken');
}
