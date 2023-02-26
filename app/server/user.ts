import bcrypt from 'bcryptjs';
import { db } from './db.server';
import type { Session } from '@remix-run/node';
import { createCookieSessionStorage } from '@remix-run/node';
import { okAsync, ResultAsync } from 'neverthrow';

type RegisterForm = {
  username: string;
  email: string;
  password: string;
};

export const getByUsername = (username: string) => {
  return ResultAsync.fromPromise(db.user.findFirst({ where: { username } }), () => new Error('error')).andThen((user) =>
    okAsync(user)
  );
};

export const register = async ({ username, email, password }: RegisterForm) => {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: { username, email, password: passwordHash },
  });
  return { id: user.id, username };
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

export const getUserSession = async (request: Request) => {
  return await storage.getSession(request.headers.get('Cookie'));
};

export async function getUserId(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get('userId');
  if (!userId || typeof userId !== 'string') return null;
  return userId;
}
