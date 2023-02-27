import type { Result } from 'neverthrow';
import { err, ok } from 'neverthrow';
import type { Branded } from '../baseTypes';
import { String5, Email } from '../baseTypes';

/**
 * UserId
 */
export type UserId = Branded<string, 'UserId'>;
export const UserId = (input: string): Result<UserId, Error> => {
  return ok(input as UserId);
};

/**
 * UserName
 */
export type UserName = Branded<string, 'UserName'>;
export const UserName = (input: string): Result<UserName, Error> => {
  const parsed = String5.safeParse(input);
  return parsed.success ? ok(parsed.data as UserName) : err(new Error('UserName must be at least 5 characters long'));
};

/**
 * An email address
 */
export type EmailAddress = Branded<string, 'EmailAddress'>;
export const EmailAddress = (input: string): Result<EmailAddress, Error> => {
  const parsed = Email.safeParse(input);
  return parsed.success ? ok(parsed.data as EmailAddress) : err(new Error('Email is invalid'));
};

/**
 * An password
 */
export type Password = Branded<string, 'Password'>;
export const Password = (input: string): Result<Password, Error> => {
  const parsed = String5.safeParse(input);
  return parsed.success ? ok(parsed.data as Password) : err(new Error('Password must be at least 5 characters long'));
};
