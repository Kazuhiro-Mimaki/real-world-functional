import { err, ok, type ResultAsync } from 'neverthrow';
import { User, type EmailAddress, type UserId } from '~/server/model/user';
import { findByUserId, findByEmail } from '~/server/repository';
import type { ApplicationContext } from '~/server/model/baseTypes.server';

/**
 * get user by email
 */
type GetByEmail = (email: EmailAddress) => ResultAsync<User | null, Error>;
export const getByEmail =
  (context: ApplicationContext): GetByEmail =>
  (email: EmailAddress) =>
    findByEmail(context)(email).andThen((user) => (user ? ok(user) : ok(null)));

/**
 * get user by id
 */
type GetByUserId = (userId: UserId) => ResultAsync<User, Error>;
export const getByUserId =
  (context: ApplicationContext): GetByUserId =>
  (userId: UserId) =>
    findByUserId(context)(userId).andThen((user) => (user ? User(user) : err(new Error('Fail to get user by id'))));
