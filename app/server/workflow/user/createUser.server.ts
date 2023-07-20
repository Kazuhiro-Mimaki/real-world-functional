import { ok, Result } from 'neverthrow';
import type { ResultAsync } from 'neverthrow';
import { EmailAddress, Password, UserName } from '~/server/model/user';
import type { CheckEmailExists } from '~/server/service';

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
// workflow
// ====================

type ValidateUser = (model: UnValidatedUser) => ResultAsync<ValidatedUser, Error | Error[]>;
const validateUser =
  (checkEmailExists: CheckEmailExists): ValidateUser =>
  (model: UnValidatedUser) => {
    const username = UserName(model.username);
    const email = EmailAddress(model.email);
    const password = Password(model.password);

    const values = Result.combineWithAllErrors([username, email, password]);
    const ret = values.map(([username, email, password]) => ({
      kind: 'Validated' as const,
      username,
      email,
      password,
    }));

    return ret.asyncAndThen((model) => checkEmailExists(model.email)).andThen(() => ret);
  };

type CreateUser = (model: ValidatedUser) => Result<CreatedUser, Error>;
const createUser: CreateUser = (model: ValidatedUser) =>
  ok({
    ...model,
    kind: 'Created' as const,
  });

type CreateUserWorkFlow = (model: UnValidatedUser) => ResultAsync<CreatedUser, Error | Error[]>;
export const createUserWorkFlow =
  (checkEmailExists: CheckEmailExists): CreateUserWorkFlow =>
  (model: UnValidatedUser) =>
    ok(model).asyncAndThen(validateUser(checkEmailExists)).andThen(createUser);
