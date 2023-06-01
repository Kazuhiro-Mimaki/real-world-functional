import type { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { err, ok, okAsync, ResultAsync } from 'neverthrow';
import { User } from './model.server';
import type { Password, UserId, UserName } from './vo.server';

import type { CreatedUser } from './workflows/createUser.server';
import type { UpdatedUser } from './workflows/updateUser.server';

/**
 * get user by username from db
 */
export type GetByUsername = (username: UserName) => ResultAsync<User | null, Error>;
export const getByUsername =
  (prisma: PrismaClient): GetByUsername =>
  (username: UserName) => {
    return ResultAsync.fromPromise(
      prisma.user.findFirst({ where: { username } }),
      () => new Error('Fail to find user by username')
    ).andThen((user) => (user ? User(user) : okAsync(null)));
  };

/**
 * get user by id from db
 */
export type GetByUserId = (userId: UserId) => ResultAsync<User, Error>;
export const getByUserId =
  (prisma: PrismaClient): GetByUserId =>
  (userId: UserId) => {
    return ResultAsync.fromPromise(
      prisma.user.findFirst({ where: { id: userId } }),
      () => new Error('Fail to find user by id')
    ).andThen((user) => (user ? User(user) : err(new Error('Cannot find user by id'))));
  };

/**
 * save user in db
 */
export type SaveUser = (createdUser: CreatedUser) => ResultAsync<User, Error>;
export const saveUser =
  (prisma: PrismaClient): SaveUser =>
  ({ username, email, password }: CreatedUser) => {
    const createPasswordHash = (password: Password): ResultAsync<string, Error> =>
      ResultAsync.fromPromise(bcrypt.hash(password, 10), () => new Error('Bcrypt error'));

    const saveUserToDB = (passwordHash: string): ResultAsync<User, Error> =>
      ResultAsync.fromPromise(
        prisma.user.create({
          data: { username, email, password: passwordHash },
        }),
        () => new Error('Fail to save user in database')
      ).andThen((user) => User(user));

    return ok(password).asyncAndThen(createPasswordHash).andThen(saveUserToDB);
  };

/**
 * update user by id in db
 */
export type UpdateUser = (updatedUser: UpdatedUser) => ResultAsync<User, Error>;
export const updateUser =
  (prisma: PrismaClient): UpdateUser =>
  ({ id, username, email, password }: UpdatedUser) => {
    const createPasswordHash = (password: Password): ResultAsync<string, Error> =>
      ResultAsync.fromPromise(bcrypt.hash(password, 10), () => new Error('Bcrypt error'));

    const updateUserById = (passwordHash: string): ResultAsync<User, Error> =>
      ResultAsync.fromPromise(
        prisma.user.update({
          where: { id },
          data: { username, email, password: passwordHash },
        }),
        () => new Error('Fail to update user')
      ).andThen((user) => User(user));

    return ok(password).asyncAndThen(createPasswordHash).andThen(updateUserById);
  };
