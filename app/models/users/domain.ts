import type { ResultAsync } from 'neverthrow';
import { err, ok } from 'neverthrow';
import type { GetByUsername } from './repo';
import type { UserName } from './vo';

export type CheckUserExists = (username: UserName) => ResultAsync<null, Error>;
export const checkUserExists =
  (getByUsername: GetByUsername): CheckUserExists =>
  (username: UserName): ResultAsync<null, Error> => {
    return getByUsername(username).andThen((user) => {
      if (user) {
        return err(new Error(`User with username "${user.username}" already exists`));
      }
      return ok(null);
    });
  };
