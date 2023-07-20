import type { User as UserSchema } from '@prisma/client';
import { Result } from 'neverthrow';
import { UserId, UserName, EmailAddress, Password } from './vo.server';

/**
 * User
 */
export type User = {
  readonly id: UserId;
  readonly username: UserName;
  readonly email: EmailAddress;
  readonly password: Password;
};
export const User = (user: UserSchema | User): Result<User, Error> => {
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
  }));
};
