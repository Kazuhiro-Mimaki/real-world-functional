import { ok, ResultAsync } from 'neverthrow';
import { User } from '~/server/model/user/model.server';
import type { EmailAddress, UserId } from '~/server/model/user/vo.server';

import type { CreatedUser, UpdatedUser } from '~/server/workflow/user';
import type { ApplicationContext } from '~/server/model/baseTypes.server';
import type { ValidationError } from '~/utils/error';
import { PrismaClientError } from '~/utils/error';

/**
 * find user by email
 */
export type FindByEmail = (email: EmailAddress) => ResultAsync<User | null, PrismaClientError | ValidationError>;
export const findByEmail =
  ({ prisma }: ApplicationContext): FindByEmail =>
  (email: EmailAddress) => {
    return ResultAsync.fromPromise(
      prisma.user.findFirst({ where: { email } }),
      (err) => new PrismaClientError('Prisma error', { cause: err })
    ).andThen((user) => (user ? User(user) : ok(null)));
  };

/**
 * find user by id
 */
export type FindByUserId = (userId: UserId) => ResultAsync<User | null, PrismaClientError | ValidationError>;
export const findByUserId =
  ({ prisma }: ApplicationContext): FindByUserId =>
  (userId: UserId) => {
    return ResultAsync.fromPromise(
      prisma.user.findFirst({ where: { id: userId } }),
      (err) => new PrismaClientError('Prisma error', { cause: err })
    ).andThen((user) => (user ? User(user) : ok(null)));
  };

/**
 * save user
 */
export type SaveUser = (createdUser: CreatedUser) => ResultAsync<User, PrismaClientError | ValidationError>;
export const saveUser =
  ({ prisma }: ApplicationContext): SaveUser =>
  ({ userId, username, email, password }: CreatedUser) =>
    ResultAsync.fromPromise(
      prisma.user.create({
        data: { id: userId, username, email, password },
      }),
      (err) => new PrismaClientError('Prisma error', { cause: err })
    ).andThen((user) => User(user));

/**
 * update user by id
 */
export type UpdateUser = (updatedUser: UpdatedUser) => ResultAsync<User, PrismaClientError | ValidationError>;
export const updateUser =
  ({ prisma }: ApplicationContext): UpdateUser =>
  ({ id, username, email, password }: UpdatedUser) =>
    ResultAsync.fromPromise(
      prisma.user.update({
        where: { id },
        data: { username, email, password },
      }),
      (err) => new PrismaClientError('Prisma error', { cause: err })
    ).andThen((user) => User(user));
