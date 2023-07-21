import type { Result } from 'neverthrow';
import { err, ok } from 'neverthrow';
import { String5, Email, NonemptyString } from '../baseTypes.server';
import { ValidationError } from '~/utils/error';

/**
 * UserId
 */
export type UserId = Branded<string, 'UserId'>;
export const UserId = (input: string): Result<UserId, ValidationError> => {
  return ok(input as UserId);
};

/**
 * UserName
 */
export type UserName = Branded<string, 'UserName'>;
export const UserName = (input: string): Result<UserName, ValidationError> => {
  const parsed = NonemptyString.safeParse(input);
  return parsed.success
    ? ok(parsed.data as UserName)
    : err(new ValidationError('Username must be at least 1 character long', { cause: parsed.error }));
};

/**
 * An email address
 */
export type EmailAddress = Branded<string, 'EmailAddress'>;
export const EmailAddress = (input: string): Result<EmailAddress, ValidationError> => {
  const parsed = Email.safeParse(input);
  return parsed.success
    ? ok(parsed.data as EmailAddress)
    : err(new ValidationError('Email is invalid', { cause: parsed.error }));
};

/**
 * An password string
 */
export type Password = Branded<string, 'Password'>;
export const Password = (input: string): Result<Password, ValidationError> => {
  const parsed = String5.safeParse(input);
  return parsed.success
    ? ok(parsed.data as Password)
    : err(new ValidationError('Password must be at least 5 characters long', { cause: parsed.error }));
};
