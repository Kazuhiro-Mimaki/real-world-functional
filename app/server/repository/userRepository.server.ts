import { ok, ResultAsync } from 'neverthrow';
import { User } from '~/server/model/user/model.server';
import type { EmailAddress, UserId } from '~/server/model/user/vo.server';

import type { CreatedUser, UpdatedUser } from '~/server/workflow/user';
import type { ApplicationContext } from '~/server/model/baseTypes.server';

/**
 * find user by email
 */
export type FindByEmail = (email: EmailAddress) => ResultAsync<User | null, Error>;
export const findByEmail =
  ({ prisma }: ApplicationContext): FindByEmail =>
  (email: EmailAddress) => {
    return ResultAsync.fromPromise(
      prisma.user.findFirst({ where: { email } }),
      () => new Error('Prisma error')
    ).andThen((user) => (user ? User(user) : ok(null)));
  };

/**
 * find user by id
 */
export type FindByUserId = (userId: UserId) => ResultAsync<User | null, Error>;
export const findByUserId =
  ({ prisma }: ApplicationContext): FindByUserId =>
  (userId: UserId) => {
    return ResultAsync.fromPromise(
      prisma.user.findFirst({ where: { id: userId } }),
      () => new Error('Prisma error')
    ).andThen((user) => (user ? User(user) : ok(null)));
  };

/**
 * save user
 */
export type SaveUser = (createdUser: CreatedUser) => ResultAsync<User, Error>;
export const saveUser =
  ({ prisma }: ApplicationContext): SaveUser =>
  ({ username, email, password }: CreatedUser) =>
    ResultAsync.fromPromise(
      prisma.user.create({
        data: { username, email, password },
      }),
      () => new Error('Prisma error')
    ).andThen((user) => User(user));

/**
 * update user by id
 */
export type UpdateUser = (updatedUser: UpdatedUser) => ResultAsync<User, Error>;
export const updateUser =
  ({ prisma }: ApplicationContext): UpdateUser =>
  ({ id, username, email, password }: UpdatedUser) =>
    ResultAsync.fromPromise(
      prisma.user.update({
        where: { id },
        data: { username, email, password },
      }),
      () => new Error('Fail to update user')
    ).andThen((user) => User(user));
