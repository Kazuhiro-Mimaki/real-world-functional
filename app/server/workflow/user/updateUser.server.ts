import type { ResultAsync } from 'neverthrow';
import { Result, ok, okAsync } from 'neverthrow';
import { EmailAddress, PasswordString, UserName, User, generateHashPassword } from '~/server/model/user';
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
  password: PasswordString;
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
    const password = PasswordString(input.password);

    const values = Result.combine([username, email, password]);

    const validatedUserInput = values.map(([username, email, password]) => ({
      kind: 'Validated' as const,
      username,
      email,
      password,
    }));

    return validatedUserInput
      .asyncAndThen((v) => (input.email === user.email ? okAsync(null) : checkEmailExists(v.email)))
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

  const updatedUser = generateHashPassword(input.password).andThen((password) =>
    User({
      ...user,
      username: input.username,
      password,
      email: input.email,
    })
  );

  return updatedUser.map((v) => ({ ...v, kind: 'Updated' as const }));
};

type UpdateUserWorkFlow = (model: UnValidatedUserCommand) => ResultAsync<UpdatedUser, Error>;
export const updateUserWorkFlow =
  (checkEmailExists: CheckEmailExists): UpdateUserWorkFlow =>
  (model: UnValidatedUserCommand) =>
    ok(model).asyncAndThen(validateUserCommand(checkEmailExists)).andThen(updateUser);
