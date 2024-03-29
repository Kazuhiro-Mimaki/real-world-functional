import { ok, Result } from 'neverthrow';
import type { ResultAsync } from 'neverthrow';
import type { GenerateUserId, UserId } from '~/server/model/user';
import { EmailAddress, UserName, Password } from '~/server/model/user';
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
export const validateUser =
  (checkEmailExists: CheckEmailExists): ValidateUser =>
  (model: UnValidatedUser) => {
    const username = UserName(model.username);
    const email = EmailAddress(model.email);
    const password = Password(model.password);

    const values = Result.combine([username, email, password]);
    const combinedValue = values.map(([username, email, password]) => ({
      username,
      email,
      password,
    }));

    return combinedValue
      .asyncAndThen((model) => checkEmailExists(model.email))
      .andThen(() => combinedValue.map((model) => ({ ...model, kind: 'Validated' as const })));
  };

type CreateUser = (model: ValidatedUser) => Result<CreatedUser, ValidationError>;
const createUser =
  (generateUserId: GenerateUserId): CreateUser =>
  (model: ValidatedUser) =>
    ok({
      ...model,
      userId: generateUserId(),
      kind: 'Created' as const,
    });

type CreateUserWorkFlow = (model: UnValidatedUser) => ResultAsync<CreatedUser, PrismaClientError | ValidationError>;
export const createUserWorkFlow =
  (checkEmailExists: CheckEmailExists, generateUserId: GenerateUserId): CreateUserWorkFlow =>
  (model: UnValidatedUser) =>
    ok(model).asyncAndThen(validateUser(checkEmailExists)).andThen(createUser(generateUserId));
