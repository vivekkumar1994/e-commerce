'use server';

import { cookies } from 'next/headers';
import { signAccessToken, signRefreshToken } from '@/lib/auth';
import { connectToDB } from '@/lib/db';
import { User } from '@/models/user';

export async function signUp({
  email,
  password,
  name,
}: {
  email: string;
  password: string;
  name: string;
}) {
  await connectToDB();

  const existing = await User.findOne({ email });
  if (existing) throw new Error('User already exists');

  const newUser = new User({ email, password, name });
  await newUser.save(); // password hashing assumed in pre-save middleware

  const payload = {
    email: newUser.email,
    name: newUser.name,
    role: newUser.role,
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

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

  return { message: 'Sign-up successful', accessToken };
}

export async function signIn({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  await connectToDB();

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    throw new Error('Invalid credentials');
  }

  const payload = {
    email: user.email,
    name: user.name,
    role: user.role,
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const cookieStore = await cookies(); // ✅ await cookies()

  // 🟢 Store secure, httpOnly tokens
  cookieStore.set('accessToken', accessToken, {
    httpOnly: true,
    secure: true,
    path: '/',
    maxAge: 60 * 15,
    sameSite: 'strict',
  });

  cookieStore.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'strict',
  });

  // 🟡 Store non-httpOnly user info (client can access these)
  cookieStore.set('userEmail', user.email, {
    httpOnly: false,
    secure: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
  });

  cookieStore.set('avatar', user.avatar, {
    httpOnly: false,
    secure: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
  });

  cookieStore.set('userName', user.name, {
    httpOnly: false,
    secure: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
  });

  cookieStore.set('userRole', user.role, {
    httpOnly: false,
    secure: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
  });
  
  cookieStore.set('id', user.id, {
    httpOnly: false,
    secure: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
  });

  return {
    message: 'Login successful',
    accessToken,
    user: {
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
}

export async function logout() {
  const cookieStore = cookies();

  (await cookieStore).set('accessToken', '', {
    httpOnly: true,
    secure: true,
    path: '/',
    expires: new Date(0),
    sameSite: 'strict',
  });

  (await cookieStore).set('refreshToken', '', {
    httpOnly: true,
    secure: true,
    path: '/',
    expires: new Date(0),
    sameSite: 'strict',
  });

  return { message: 'Logout successful' };
}
