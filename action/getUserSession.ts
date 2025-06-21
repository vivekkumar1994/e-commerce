'use server';

import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

type UserSession = {
  email: string;
  name: string;
  role: string;
  avatar:string;
} | null;

export default async function getUserSession(): Promise<UserSession> {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;

  let email = cookieStore.get('userEmail')?.value;
  let name = cookieStore.get('userName')?.value;
  let role = cookieStore.get('userRole')?.value;
  let avatar = cookieStore.get("avatar")?.value;



  if (!accessToken && !refreshToken) return null;

  try {
    jwt.verify(accessToken!, process.env.ACCESS_SECRET!);
    if (email && name && role) {
      return { email, name, role };
    } else {
      return null;
    }
  } catch (err) {
    try {
      const decodedRefresh = jwt.verify(refreshToken!, process.env.REFRESH_SECRET!) as {
        email: string;
        name: string;
        role: string;
        avatar:string
      };

      // Issue a new access token
      const newAccessToken = jwt.sign(
        {
          email: decodedRefresh.email,
          name: decodedRefresh.name,
          role: decodedRefresh.role,
        },
        process.env.ACCESS_SECRET!,
        { expiresIn: '2h' }
      );

      // Reset cookies
      cookieStore.set('accessToken', newAccessToken, {
        httpOnly: true,
        secure: true,
        path: '/',
        maxAge: 2 * 60 * 60,
        sameSite: 'strict',
      });

      cookieStore.set('userEmail', decodedRefresh.email, {
        httpOnly: false,
        secure: true,
        path: '/',
        maxAge: 2 * 60 * 60,
        sameSite: 'lax',
      });
      cookieStore.set('userName', decodedRefresh.name, {
        httpOnly: false,
        secure: true,
        path: '/',
        maxAge: 2 * 60 * 60,
        sameSite: 'lax',
      });
      cookieStore.set('userRole', decodedRefresh.role, {
        httpOnly: false,
        secure: true,
        path: '/',
        maxAge: 2 * 60 * 60,
        sameSite: 'lax',
      });
      cookieStore.set('avatar', decodedRefresh.avatar, {
        httpOnly: false,
        secure: true,
        path: '/',
        maxAge: 2 * 60 * 60,
        sameSite: 'lax',
      });

      return {
        email: decodedRefresh.email,
        name: decodedRefresh.name,
        role: decodedRefresh.role,
        avatar:decodedRefresh.avatar,
      };
    } catch (refreshError) {
      console.error('Refresh token invalid or expired:', refreshError);
      return null;
    }
  }
}
