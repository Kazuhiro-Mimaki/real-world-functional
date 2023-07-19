import type { Result } from 'neverthrow';
import { err, ok } from 'neverthrow';
import type { Branded } from '../baseTypes.server';
import { String5, Email } from '../baseTypes.server';

/**
 * UserId
 */
export type UserId = Branded<number, 'UserId'>;
export const UserId = (input: number): Result<UserId, Error> => {
  return ok(input as UserId);
};

/**
 * UserName
 */
export type UserName = Branded<string, 'UserName'>;
export const UserName = (input: string): Result<UserName, Error> => {
  return ok(input as UserName);
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