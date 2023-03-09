import bcrypt from 'bcryptjs';
import { err, ok, okAsync, ResultAsync } from 'neverthrow';
import { db } from '~/server/db.server';
import { User } from './domain';
import type { Password, UserId, UserName } from './vo';

import type { CreatedUser } from './workflows/createUser';
import type { UpdatedUser } from './workflows/updateUser';

/**
 * get user by username from db
 */
export type GetByUsername = (username: UserName) => ResultAsync<User | null, Error>;
export const getByUsername: GetByUsername = (username: UserName) => {
  return ResultAsync.fromPromise(db.user.findFirst({ where: { username } }), (e) => {
    console.log(e);
    return new Error('Prisma error');
  }).andThen((user) => (user ? User(user) : okAsync(null)));
};

/**
 * get user by id from db
 */
export type GetByUserId = (userId: UserId) => ResultAsync<User, Error>;
export const getByUserId: GetByUserId = (userId: UserId) => {
  return ResultAsync.fromPromise(
    db.user.findFirst({ where: { id: userId } }),
    () => new Error('Cannot get user by id')
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
      db.user.create({
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
      db.user.update({
        where: { id },
        data: { username, email, password: passwordHash },
      }),
      () => new Error('Prisma error')
    ).andThen((user) => User(user));

  return ok(password).asyncAndThen(createPasswordHash).andThen(updateUserById);
};
