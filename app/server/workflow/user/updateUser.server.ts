import type { ResultAsync } from 'neverthrow';
import { Result, ok, okAsync } from 'neverthrow';
import { Password } from '~/server/model/user';
import { EmailAddress, UserName, User } from '~/server/model/user';
import type { CheckCurrentPassword } from '~/server/service';
import { type CheckEmailExists } from '~/server/service';
import type { PrismaClientError, ValidationError } from '~/utils/error';

// ====================
// Type
// ====================

type UnValidatedUserInput = {
  kind: 'UnValidated';
  username: string;
  email: string;
  currentPassword: string;
  newPassword: string;
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

type ValidateUserCommand = (
  model: UnValidatedUserCommand
) => ResultAsync<ValidatedUserCommand, PrismaClientError | ValidationError>;
const validateUserCommand =
  (checkEmailExists: CheckEmailExists, checkCurrentPassword: CheckCurrentPassword): ValidateUserCommand =>
  (model: UnValidatedUserCommand) => {
    const { input, user } = model;

    const username = UserName(input.username);
    const email = EmailAddress(input.email);
    const currentPassword = Password(input.currentPassword);
    const newPassword = Password(input.newPassword);

    const values = Result.combine([username, email, currentPassword, newPassword]);

    const validatedUserInput = values.map(([username, email, currentPassword, newPassword]) => ({
      kind: 'Validated' as const,
      username,
      email,
      currentPassword,
      newPassword,
    }));

    return validatedUserInput
      .asyncAndThen((input) => (input.email === user.email ? okAsync(null) : checkEmailExists(input.email)))
      .andThen(() => validatedUserInput.andThen((input) => checkCurrentPassword(input.currentPassword, user.password)))
      .andThen(() =>
        validatedUserInput.map((v) => ({
          input: {
            ...v,
            password: v.newPassword,
          },
          user,
        }))
      );
  };

type UpdateUser = (model: ValidatedUserCommand) => Result<UpdatedUser, ValidationError>;
const updateUser: UpdateUser = (model: ValidatedUserCommand) => {
  const { input, user } = model;

  const updatedUser = User({
    ...user,
    username: input.username,
    password: input.password,
    email: input.email,
  });

  return updatedUser.map((v) => ({ ...v, kind: 'Updated' as const }));
};

type UpdateUserWorkFlow = (
  model: UnValidatedUserCommand
) => ResultAsync<UpdatedUser, PrismaClientError | ValidationError>;
export const updateUserWorkFlow =
  (checkEmailExists: CheckEmailExists, checkCurrentPassword: CheckCurrentPassword): UpdateUserWorkFlow =>
  (model: UnValidatedUserCommand) =>
    ok(model).asyncAndThen(validateUserCommand(checkEmailExists, checkCurrentPassword)).andThen(updateUser);
