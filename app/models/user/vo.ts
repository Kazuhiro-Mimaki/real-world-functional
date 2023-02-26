import type { Result } from 'neverthrow';
import { err, ok } from 'neverthrow';
import type { ZodError } from 'zod';
import { String5, Email } from '../baseTypes';

/**
 * UserName
 */
export type UserName = String5;
export const UserName = (input: string): Result<string, ZodError<string>> => {
  const parsed = String5.safeParse(input);
  return parsed.success ? ok(parsed.data) : err(parsed.error);
};

/**
 * An email address
 */
export type EmailAddress = Email;
export const EmailAddress = (input: string): Result<string, ZodError<string>> => {
  const parsed = Email.safeParse(input);
  return parsed.success ? ok(parsed.data) : err(parsed.error);
};

/**
 * An password
 */
export type Password = String5;
export const Password = (input: string): Result<string, ZodError<string>> => {
  const parsed = String5.safeParse(input);
  return parsed.success ? ok(parsed.data) : err(parsed.error);
};
