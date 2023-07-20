import type { User as UserSchema } from '@prisma/client';
import { Result } from 'neverthrow';
import { HashPassword } from './vo.server';
import type { PasswordString } from './vo.server';
import { UserId, UserName, EmailAddress } from './vo.server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * User
 */
export type User = {
  readonly id: UserId;
  readonly username: UserName;
  readonly email: EmailAddress;
  readonly password: HashPassword;
};
export const User = (user: UserSchema | User): Result<User, Error> => {
  const userId = UserId(user.id);
  const username = UserName(user.username);
  const email = EmailAddress(user.email);
  const password = HashPassword(user.password);

  const values = Result.combine([userId, username, email, password]);
  return values.map(([userId, username, email, password]) => ({
    id: userId,
    username,
    email,
    password,
  }));
};

export const generateUserId = () => UserId(crypto.randomUUID());

export const generateHashPassword = (
  password: PasswordString,
  saltRounds: number = 10
): Result<HashPassword, Error> => {
  return HashPassword(bcrypt.hashSync(password, saltRounds));
};
