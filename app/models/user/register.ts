import type { User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Result } from 'neverthrow';
import { ResultAsync } from 'neverthrow';
import { err, ok } from 'neverthrow';
import { db } from '~/server/db.server';

// ====================
// Value object
// ====================

type Username = string;
const Username = (input: string): Result<Username, Error> => {
  if (input.length < 3) {
    return err(new Error('Must be 3 or more characters long'));
  }
  return ok(input);
};

type Email = string;
const Email = (input: string): Result<Email, Error> => {
  if (input.length < 5) {
    return err(new Error('Must be 5 or more characters long'));
  }
  return ok(input);
};

type Password = string;
const Password = (input: string): Result<Password, Error> => {
  if (input.length < 6) {
    return err(new Error('Must be 6 or more characters long'));
  }
  return ok(input);
};

// ====================
// Type
// ====================

export type UnValidatedUser = {
  kind: 'UnValidated';
  username: FormDataEntryValue | null;
  email: FormDataEntryValue | null;
  password: FormDataEntryValue | null;
};

type ValidatedUser = {
  kind: 'Validated';
  username: Username;
  email: Email;
  password: Password;
};

type CreatedUser = {
  kind: 'Created';
  username: Username;
  email: Email;
  password: Password;
};

// ====================
// Function
// ====================

export const validateUser = (model: UnValidatedUser): Result<ValidatedUser, Error> => {
  const username = Username(model.username as string);
  const email = Email(model.email as string);
  const password = Password(model.password as string);

  const values = Result.combine([username, email, password]);

  return values.map(([username, email, password]) => ({
    kind: 'Validated',
    username,
    email,
    password,
  }));
};

export const createUser = (model: ValidatedUser): ResultAsync<CreatedUser, Error> => {
  const findUserByUsername = (username: Username) =>
    ResultAsync.fromPromise(db.user.findFirst({ where: { username: username } }), () => new Error('Prisma error'));

  const checkUserExists = (existsUser: User | null): Result<User | null, Error> => {
    if (existsUser) {
      return err(new Error(`User with username ${model.username} already exists`));
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
