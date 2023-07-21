import { ok, Result } from 'neverthrow';
import type { ResultAsync } from 'neverthrow';
import type { UserId } from '~/server/model/user';
import { generateUserId, EmailAddress, UserName, Password } from '~/server/model/user';
import type { CheckEmailExists } from '~/server/service';
import type { PrismaClientError, ValidationError } from '~/utils/error';

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
  userId: UserId;
  username: UserName;
  email: EmailAddress;
  password: Password;
};

// ====================
// workflow
// ====================

type ValidateUser = (model: UnValidatedUser) => ResultAsync<ValidatedUser, PrismaClientError | ValidationError>;
const validateUser =
  (checkEmailExists: CheckEmailExists): ValidateUser =>
  (model: UnValidatedUser) => {
    const username = UserName(model.username);
    const email = EmailAddress(model.email);
    const password = Password(model.password);

    const values = Result.combine([username, email, password]);
    const validatedUserInput = values.map(([username, email, password]) => ({
      kind: 'Validated' as const,
      username,
      email,
      password,
    }));

    return validatedUserInput.asyncAndThen((model) => checkEmailExists(model.email)).andThen(() => validatedUserInput);
  };

type CreateUser = (model: ValidatedUser) => Result<CreatedUser, ValidationError>;
const createUser: CreateUser = (model: ValidatedUser) =>
  ok({
    ...model,
    userId: generateUserId(),
    kind: 'Created' as const,
  });

type CreateUserWorkFlow = (model: UnValidatedUser) => ResultAsync<CreatedUser, PrismaClientError | ValidationError>;
export const createUserWorkFlow =
  (checkEmailExists: CheckEmailExists): CreateUserWorkFlow =>
  (model: UnValidatedUser) =>
    ok(model).asyncAndThen(validateUser(checkEmailExists)).andThen(createUser);
