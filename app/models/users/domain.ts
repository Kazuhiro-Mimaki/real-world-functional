import type { User as UserModel } from '@prisma/client';
import type { ResultAsync } from 'neverthrow';
import { err, ok, Result } from 'neverthrow';
import type { GetByUsername } from './repo';
import { UserId, UserName, EmailAddress } from './vo';

/**
 * User
 */
export type User = Readonly<{
  id: UserId;
  username: UserName;
  email: EmailAddress;
  createdAt: Date;
  updatedAt: Date;
}>;
export const User = (user: UserModel): Result<User, Error> => {
  const userId = UserId(user.id);
  const username = UserName(user.username);
  const email = EmailAddress(user.email);

  const values = Result.combine([userId, username, email]);
  return values.map(([userId, username, email]) => ({
    id: userId,
    username,
    email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }));
};

export type CheckUserExists = (username: UserName) => ResultAsync<null, Error>;
export const checkUserExists =
  (getByUsername: GetByUsername): CheckUserExists =>
  (username: UserName): ResultAsync<null, Error> => {
    return getByUsername(username).andThen((user) => {
      if (user) {
        return err(new Error(`User with username "${user.username}" already exists`));
      }
      return ok(null);
    });
  };
