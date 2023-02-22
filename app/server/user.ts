import bcrypt from 'bcryptjs';
import { db } from './db.server';
import type { Session } from '@remix-run/node';
import { createCookieSessionStorage } from '@remix-run/node';

type RegisterForm = {
  name: string;
  password: string;
};

export const getByName = async (name: string) => {
  return await db.user.findFirst({
    where: { name },
  });
};

export const register = async ({ name, password }: RegisterForm) => {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: { name, password: passwordHash },
  });
  return { id: user.id, name };
};

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error('SESSION_SECRET must be set');
}

const storage = createCookieSessionStorage({
  cookie: {
    name: 'RJ_session',
    // normally you want this to be `secure: true`
    // but that doesn't work on localhost for Safari
    // https://web.dev/when-to-use-local-https/
    secure: process.env.NODE_ENV === 'production',
    secrets: [sessionSecret],
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

export const createUserSession = async (userId: string) => {
  const session = await storage.getSession();
  session.set('userId', userId);
  return session;
};

export const commitUserSession = async (session: Session) => {
  return await storage.commitSession(session);
};
