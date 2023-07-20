import type { Result } from 'neverthrow';
import { err, ok, type ResultAsync } from 'neverthrow';
import type { Password } from '~/server/model/user';
import { User, type EmailAddress, type UserId } from '~/server/model/user';
import { findByUserId, findByEmail } from '~/server/repository';
import type { ApplicationContext } from '~/server/model/baseTypes.server';

/**
 * check email already exist
 */
export type CheckEmailExists = (email: EmailAddress) => ResultAsync<null, Error>;
export const checkEmailExists =
  (context: ApplicationContext): CheckEmailExists =>
  (email: EmailAddress) =>
    findByEmail(context)(email).andThen((user) => (user ? err(new Error('The email already exists')) : ok(null)));

/**
 * check password is correct
 */
export type CheckCurrentPassword = (inputPass: Password, currentPass: User['password']) => Result<null, Error>;
export const checkCurrentPassword = (): CheckCurrentPassword => (inputPass: Password, currentPass: User['password']) =>
  inputPass === currentPass ? ok(null) : err(new Error('The current password is incorrect'));

/**
 * get user by id
 */
type GetByUserId = (userId: UserId) => ResultAsync<User, Error>;
export const getByUserId =
  (context: ApplicationContext): GetByUserId =>
  (userId: UserId) =>
    findByUserId(context)(userId).andThen((user) => (user ? User(user) : err(new Error('Fail to get user by id'))));
