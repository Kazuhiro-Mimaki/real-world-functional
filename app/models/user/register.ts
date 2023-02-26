import type { User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Result } from 'neverthrow';
import { ResultAsync } from 'neverthrow';
import { err, ok } from 'neverthrow';
import { db } from '~/server/db.server';
import { EmailAddress, Password, UserName } from './vo';

// ====================
// Type
// ====================

export type UnValidatedUser = {
  kind: 'UnValidated';
  username: string;
  email: string;
  password: string;
};

export type ValidatedUser = {
  kind: 'Validated';
  username: UserName;
  email: EmailAddress;
  password: Password;
};

export type CreatedUser = {
  kind: 'Created';
  username: UserName;
  email: EmailAddress;
  password: Password;
};

// ====================
// Function
// ====================

export const validateUser = (model: UnValidatedUser): Result<ValidatedUser, Error> => {
  const username = UserName(model.username);
  const email = EmailAddress(model.email);
  const password = Password(model.password);

  const values = Result.combine([username, email, password]);

  return values.map(([username, email, password]) => ({
    kind: 'Validated',
    username,
    email,
    password,
  }));
};

export const createUser = (model: ValidatedUser): ResultAsync<CreatedUser, Error> => {
  const findUserByUsername = (username: string) =>
    ResultAsync.fromPromise(db.user.findFirst({ where: { username: username } }), () => new Error('Prisma error'));

  const checkUserExists = (existsUser: User | null): Result<User | null, Error> => {
    if (existsUser) {
      return err(new Error(`User with username "${model.username}" already exists`));
    }
    return ok(existsUser);
  };

  return findUserByUsername(model.username)
    .andThen(checkUserExists)
    .andThen(() =>
      ok({
        ...model,
        kind: 'Created' as const,
      })
    );
};

type RegisterForm = {
  username: string;
  email: string;
  password: string;
};

export const saveUser = ({ username, email, password }: RegisterForm): ResultAsync<User, Error> => {
  const createPasswordHash = ResultAsync.fromPromise(bcrypt.hash(password, 10), () => new Error('Bcrypt error'));

  const saveUserToDB = (passwordHash: string) =>
    ResultAsync.fromPromise(
      db.user.create({
        data: { username, email, password: passwordHash },
      }),
      () => new Error('Prisma error')
    );

  return createPasswordHash.andThen(saveUserToDB).andThen((user) => ok(user));
};
