import type { ResultAsync } from 'neverthrow';
import { Result, ok } from 'neverthrow';
import { EmailAddress, Password, UserName } from '~/server/model/user';
import { User } from '~/server/model/user';
import { type CheckEmailExists } from '~/server/service';

// ====================
// Type
// ====================

type UnValidatedUserInput = {
  kind: 'UnValidated';
  username: string;
  email: string;
  password: string;
};

type UnValidatedUserCommand = {
  input: UnValidatedUserInput;
  user: User;
};

type ValidatedUserInput = {
  kind: 'Validated';
  username: UserName;
  email: EmailAddress;
  password: Password;
};

type ValidatedUserCommand = {
  input: ValidatedUserInput;
  user: User;
};

export type UpdatedUser = User & {
  kind: 'Updated';
};

// ====================
// workflow
// ====================

type ValidateUserCommand = (model: UnValidatedUserCommand) => ResultAsync<ValidatedUserCommand, Error>;
const validateUserCommand =
  (checkEmailExists: CheckEmailExists): ValidateUserCommand =>
  (model: UnValidatedUserCommand) => {
    const { input, user } = model;

    const username = UserName(input.username);
    const email = EmailAddress(input.email);
    const password = Password(input.password);

    const values = Result.combine([username, email, password]);

    const validatedUserInput = values.map(([username, email, password]) => ({
      kind: 'Validated' as const,
      username,
      email,
      password,
    }));

    return validatedUserInput
      .asyncAndThen((v) => checkEmailExists(v.email))
      .andThen(() =>
        validatedUserInput.map((v) => ({
          input: v,
          user,
        }))
      );
  };

type UpdateUser = (model: ValidatedUserCommand) => Result<UpdatedUser, Error>;
const updateUser: UpdateUser = (model: ValidatedUserCommand) => {
  const { input, user } = model;

  const updatedUser = User({
    ...user,
    username: input.username,
    email: input.email,
    password: input.password,
  });

  return updatedUser.map((v) => ({ ...v, kind: 'Updated' as const }));
};

type UpdateUserWorkFlow = (model: UnValidatedUserCommand) => ResultAsync<UpdatedUser, Error>;
export const updateUserWorkFlow =
  (checkEmailExists: CheckEmailExists): UpdateUserWorkFlow =>
  (model: UnValidatedUserCommand) =>
    ok(model).asyncAndThen(validateUserCommand(checkEmailExists)).andThen(updateUser);
