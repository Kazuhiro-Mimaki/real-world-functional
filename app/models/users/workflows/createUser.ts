import { err, Result } from 'neverthrow';
import type { ResultAsync } from 'neverthrow';
import { ok } from 'neverthrow';
import { EmailAddress, Password, UserName } from '../vo';
import type { GetByUsername } from '../repository';

// ====================
// Type
// ====================

type UnValidatedUser = {
  kind: 'UnValidated';
  username: string;
  email: string;
  password: string;
};

type ValidatedUser = {
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
// step1
// ====================

export type ValidateUser = (model: UnValidatedUser) => Result<ValidatedUser, Error>;
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

// ====================
// step2
// ====================

export type CreateUser = (model: ValidatedUser) => ResultAsync<CreatedUser, Error>;
export const createUser =
  (getByUsername: GetByUsername): CreateUser =>
  (model: ValidatedUser) =>
    ok(model.username)
      .asyncAndThen(getByUsername)
      .andThen((user) => {
        if (user) {
          return err(new Error(`User with username "${user.username}" already exists`));
        }

        return ok({
          ...model,
          kind: 'Created' as const,
        });
      });

// ====================
// workflow
// ====================

export type CreateUserWorkFlow = (model: UnValidatedUser) => ResultAsync<CreatedUser, Error>;
export const createUserWorkFlow =
  (getByUsername: GetByUsername): CreateUserWorkFlow =>
  (model: UnValidatedUser) =>
    ok(model).andThen(validateUser).asyncAndThen(createUser(getByUsername));
