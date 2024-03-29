import type { User as UserSchema } from '@prisma/client';
import { Result } from 'neverthrow';
import { Password } from './vo.server';
import { UserId, UserName, EmailAddress } from './vo.server';
import crypto from 'crypto';
import type { ValidationError } from '~/utils/error';

/**
 * User
 */
export type User = {
  readonly id: UserId;
  readonly username: UserName;
  readonly email: EmailAddress;
  readonly password: Password;
};
export const User = (user: UserSchema | User): Result<User, ValidationError> => {
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

export type GenerateUserId = () => UserId;
export const generateUserId = (): GenerateUserId => () => crypto.randomUUID() as UserId;
