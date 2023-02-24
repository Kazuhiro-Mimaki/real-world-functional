import type { User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Result } from 'neverthrow';
import { ResultAsync } from 'neverthrow';
import { err, ok } from 'neverthrow';
import { db } from '~/server/db.server';

// ====================
// Value object
// ====================

const validateUsername = (input: FormDataEntryValue | null): Result<string, Error> => {
  if (typeof input !== 'string' || input.length < 3) {
    return err(new Error('Username must be 3 or more characters long'));
  }
  return ok(input);
};

const validateEmail = (input: FormDataEntryValue | null): Result<string, Error> => {
  if (typeof input !== 'string' || input.length < 5) {
    return err(new Error('Email must be 5 or more characters long'));
  }
  return ok(input);
};

const validatePassword = (input: FormDataEntryValue | null): Result<string, Error> => {
  if (typeof input !== 'string' || input.length < 6) {
    return err(new Error('Password must be 6 or more characters long'));
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

export type ValidatedUser = {
  kind: 'Validated';
  username: string;
  email: string;
  password: string;
};

export type CreatedUser = {
  kind: 'Created';
  username: string;
  email: string;
  password: string;
};

// ====================
// Function
// ====================

export const validateUser = (model: UnValidatedUser): Result<ValidatedUser, Error> => {
  const username = validateUsername(model.username);
  const email = validateEmail(model.email);
  const password = validatePassword(model.password);

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
