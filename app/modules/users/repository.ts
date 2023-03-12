import bcrypt from 'bcryptjs';
import { err, ok, okAsync, ResultAsync } from 'neverthrow';
import { prisma } from '~/server/db.server';
import { User } from './model';
import type { Password, UserId, UserName } from './vo';

import type { CreatedUser } from './workflows/createUser';
import type { UpdatedUser } from './workflows/updateUser';

/**
 * get user by username from db
 */
export type GetByUsername = (username: UserName) => ResultAsync<User | null, Error>;
export const getByUsername: GetByUsername = (username: UserName) => {
  return ResultAsync.fromPromise(
    prisma.user.findFirst({ where: { username } }),
    () => new Error('Fail to find user by username')
  ).andThen((user) => (user ? User(user) : okAsync(null)));
};

/**
 * get user by id from db
 */
export type GetByUserId = (userId: UserId) => ResultAsync<User, Error>;
export const getByUserId: GetByUserId = (userId: UserId) => {
  return ResultAsync.fromPromise(
    prisma.user.findFirst({ where: { id: userId } }),
    () => new Error('Fail to find user by id')
  ).andThen((user) => (user ? User(user) : err(new Error('Cannot find user by id'))));
};

/**
 * save user in db
 */
export type SaveUser = (createdUser: CreatedUser) => ResultAsync<User, Error>;
export const saveUser: SaveUser = ({ username, email, password }: CreatedUser) => {
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
export const updateUser: UpdateUser = ({ id, username, email, password }: UpdatedUser) => {
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
