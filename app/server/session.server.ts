import type { Session, SessionData } from '@remix-run/node';
import { createCookieSessionStorage } from '@remix-run/node';
import { ResultAsync, ok } from 'neverthrow';

type SessionType = Session<SessionData, SessionData>;
type Cookie = Branded<string, 'Cookie'>;

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

export const createUserSession = (userId: number): ResultAsync<SessionType, Error> =>
  ResultAsync.fromPromise(storage.getSession(), () => new Error('Failed to create session')).andThen((session) => {
    session.set('userId', userId);
    return ok(session);
  });

export const commitUserSession = (session: Session): ResultAsync<Cookie, Error> =>
  ResultAsync.fromPromise(
    storage.commitSession(session) as Promise<Cookie>,
    () => new Error('Failed to commit session')
  );

const getUserSession = async (headers: Headers) => {
  return await storage.getSession(headers.get('Cookie'));
};

export const getUserIdFromSession = async (request: Request) => {
  const session = await getUserSession(request.headers);
  const userId = session.get('userId');
  if (!userId || typeof userId !== 'number') {
    throw new Error('Unauthorized');
  }
  return userId;
};
