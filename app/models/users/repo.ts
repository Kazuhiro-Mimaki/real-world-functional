import { ok, okAsync, ResultAsync } from 'neverthrow';
import { db } from '~/server/db.server';
import { User } from './domain';
import type { UserName } from './vo';
import { createPasswordHash } from './vo';
import type { CreatedUser } from './workflows/createUser';

/**
 * get user by username from db
 */
export type GetByUsername = (username: UserName) => ResultAsync<User | null, Error>;
export const getByUsername: GetByUsername = (username: UserName) => {
  return ResultAsync.fromPromise(db.user.findFirst({ where: { username } }), () => new Error('Prisma error')).andThen(
    (user) => (user ? User(user) : okAsync(null))
  );
};

/**
 * save user in db
 */
export type SaveUser = (createdUser: CreatedUser) => ResultAsync<User, Error>;
export const saveUser: SaveUser = ({ username, email, password }: CreatedUser) => {
  const saveUserToDB = (passwordHash: string): ResultAsync<User, Error> =>
    ResultAsync.fromPromise(
      db.user.create({
        data: { username, email, password: passwordHash },
      }),
      () => new Error('Prisma error')
    ).andThen((user) => User(user));

  return ok(password).asyncAndThen(createPasswordHash).andThen(saveUserToDB);
};
