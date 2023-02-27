import type { PrismaClient, User } from '@prisma/client';
import { okAsync, ResultAsync } from 'neverthrow';
import type { UserName } from './vo';

export type GetByUsername = (username: UserName) => ResultAsync<User | null, Error>;
export const getByUsername =
  (db: PrismaClient): GetByUsername =>
  (username: UserName): ResultAsync<User | null, Error> => {
    return ResultAsync.fromPromise(db.user.findFirst({ where: { username } }), () => new Error('Prisma error')).andThen(
      (user) => (user ? okAsync(user) : okAsync(null))
    );
  };
