import type { Result } from 'neverthrow';
import { err, ok } from 'neverthrow';
import type { ZodError } from 'zod';
import type { Branded } from '../baseTypes';
import { String5, Email } from '../baseTypes';

/**
 * UserName
 */
export type UserName = Branded<string, 'UserName'>;
export const UserName = (input: string): Result<UserName, ZodError<string>> => {
  const parsed = String5.safeParse(input);
  return parsed.success ? ok(parsed.data as UserName) : err(parsed.error);
};

/**
 * An email address
 */
export type EmailAddress = Branded<string, 'EmailAddress'>;
export const EmailAddress = (input: string): Result<EmailAddress, ZodError<string>> => {
  const parsed = Email.safeParse(input);
  return parsed.success ? ok(parsed.data as EmailAddress) : err(parsed.error);
};

/**
 * An password
 */
export type Password = Branded<string, 'Password'>;
export const Password = (input: string): Result<Password, ZodError<string>> => {
  const parsed = String5.safeParse(input);
  return parsed.success ? ok(parsed.data as Password) : err(parsed.error);
};
