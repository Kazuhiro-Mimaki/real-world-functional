import type { Result } from 'neverthrow';
import { err, ok } from 'neverthrow';
import { String5, Email, NonemptyString } from '../baseTypes.server';

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
  const parsed = NonemptyString.safeParse(input);
  return parsed.success ? ok(parsed.data as UserName) : err(new Error('Username must be at least 1 character long'));
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
 * An password string
 */
export type PasswordString = Branded<string, 'PasswordString'>;
export const PasswordString = (input: string): Result<PasswordString, Error> => {
  const parsed = String5.safeParse(input);
  return parsed.success
    ? ok(parsed.data as PasswordString)
    : err(new Error('Password must be at least 5 characters long'));
};

/**
 * An hash password
 */
export type HashPassword = Branded<string, 'HashPassword'>;
export const HashPassword = (input: string): Result<HashPassword, Error> => {
  return ok(input as HashPassword);
};
