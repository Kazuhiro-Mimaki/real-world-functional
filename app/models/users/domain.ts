import type { User as UserModel } from '@prisma/client';
import { Result } from 'neverthrow';
import { UserId, UserName, EmailAddress } from './vo';

/**
 * User
 */
export type User = {
  readonly id: UserId;
  readonly username: UserName;
  readonly email: EmailAddress;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};
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
