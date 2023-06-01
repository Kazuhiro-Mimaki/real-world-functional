import type { User as UserModel } from '@prisma/client';
import { Result } from 'neverthrow';
import { Password } from './vo.server';
import { UserId, UserName, EmailAddress } from './vo.server';

/**
 * User
 */
export type User = {
  readonly id: UserId;
  readonly username: UserName;
  readonly email: EmailAddress;
  readonly password: Password;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};
export const User = (user: UserModel): Result<User, Error> => {
  const userId = UserId(user.id);
  const username = UserName(user.username);
  const email = EmailAddress(user.email);
  const password = Password(user.password);

  const values = Result.combine([userId, username, email, password]);
  return values.map(([userId, username, email, password]) => ({
    id: userId,
    username,
    email,
    password,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }));
};
