import { err, ok, type ResultAsync } from 'neverthrow';
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
 * get user by id
 */
type GetByUserId = (userId: UserId) => ResultAsync<User, Error>;
export const getByUserId =
  (context: ApplicationContext): GetByUserId =>
  (userId: UserId) =>
    findByUserId(context)(userId).andThen((user) => (user ? User(user) : err(new Error('Fail to get user by id'))));
