import { Result } from 'neverthrow';
import type { ResultAsync } from 'neverthrow';
import { ok } from 'neverthrow';
import { EmailAddress, Password, UserName } from '../vo';
import type { CheckUserExists } from '../domain';

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
// Function
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

export type CreateUser = (model: ValidatedUser) => ResultAsync<CreatedUser, Error>;
export const createUser =
  (checkUserExists: CheckUserExists): CreateUser =>
  (model: ValidatedUser): ResultAsync<CreatedUser, Error> => {
    return checkUserExists(model.username).andThen(() =>
      ok({
        ...model,
        kind: 'Created' as const,
      })
    );
  };

export type CreateUserWorkFlow = (model: UnValidatedUser) => ResultAsync<CreatedUser, Error>;
export const createUserWorkFlow =
  (checkUserExists: CheckUserExists): CreateUserWorkFlow =>
  (model: UnValidatedUser) =>
    ok(model).andThen(validateUser).asyncAndThen(createUser(checkUserExists));
