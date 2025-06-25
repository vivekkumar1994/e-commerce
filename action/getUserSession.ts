'use server';

import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

type UserSession = {
  email: string;
  name: string;
  role: string;
  avatar?: string;
} | null;

export default async function getUserSession(): Promise<UserSession> {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;

  const email = cookieStore.get('userEmail')?.value;
  const name = cookieStore.get('userName')?.value;
  const role = cookieStore.get('userRole')?.value;
  const avatar = cookieStore.get('avatar')?.value;

 

  if (!accessToken && !refreshToken) return null;

  try {
    jwt.verify(accessToken!, process.env.ACCESS_SECRET!);

    if (email && name && role && avatar) {
      console.log("access",email,name,role)
      return { email, name, role, avatar };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Access token verification failed:', error);
    try {
      const decodedRefresh = jwt.verify(refreshToken!, process.env.REFRESH_SECRET!) as {
        email: string;
        name: string;
        role: string;
        avatar: string;
      };

      const newAccessToken = jwt.sign(
        {
          email: decodedRefresh.email,
          name: decodedRefresh.name,
          role: decodedRefresh.role,
        },
        process.env.ACCESS_SECRET!,
        { expiresIn: '2h' }
      );

      // Set new access token and related user info
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
        avatar: decodedRefresh.avatar,
      };
    } catch (refreshError) {
      console.error('Refresh token invalid or expired:', refreshError);
      return null;
    }
  }
}
