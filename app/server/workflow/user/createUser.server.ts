import { err, ok, Result } from 'neverthrow';
import type { ResultAsync } from 'neverthrow';
import { EmailAddress, Password, UserName } from '~/server/model/user';
import type { FindByEmail } from '~/server/repository';

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

type ValidateUser = (model: UnValidatedUser) => Result<ValidatedUser, Error[]>;
const validateUser: ValidateUser = (model: UnValidatedUser) => {
  const username = UserName(model.username);
  const email = EmailAddress(model.email);
  const password = Password(model.password);

  const values = Result.combineWithAllErrors([username, email, password]);

  return values.map(([username, email, password]) => ({
    kind: 'Validated',
    username,
    email,
    password,
  }));
};

type CreateUser = (model: ValidatedUser) => ResultAsync<CreatedUser, Error>;
const createUser =
  (findByEmail: FindByEmail): CreateUser =>
  (model: ValidatedUser) =>
    ok(model.email)
      .asyncAndThen(findByEmail)
      .andThen((user) => {
        if (user) {
          return err(new Error(`The email is already used`));
        }

        return ok({
          ...model,
          kind: 'Created' as const,
        });
      });

type CreateUserWorkFlow = (model: UnValidatedUser) => ResultAsync<CreatedUser, Error | Error[]>;
export const createUserWorkFlow =
  (findByEmail: FindByEmail): CreateUserWorkFlow =>
  (model: UnValidatedUser) =>
    ok(model).andThen(validateUser).asyncAndThen(createUser(findByEmail));
