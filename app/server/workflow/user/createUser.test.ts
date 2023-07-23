import { describe, expect, it } from 'vitest';
import { validateUser } from './createUser.server';
import { errAsync, okAsync } from 'neverthrow';
import { ValidationError } from '~/utils/error';

const noDuplicatedEmailExists = () => okAsync(null);
const duplicatedEmailExists = () => errAsync(new ValidationError('The email already exists'));

describe('ValidateUserのテスト', () => {
  it('成功: 正常', async () => {
    const unValidatedInput = {
      kind: 'UnValidated' as const,
      username: 'username',
      email: 'email@example.com',
      password: 'password',
    };
    const result = await validateUser(noDuplicatedEmailExists)(unValidatedInput);
    expect(result._unsafeUnwrap()).toEqual({
      kind: 'Validated' as const,
      username: 'username',
      email: 'email@example.com',
      password: 'password',
    });
  });

  it('エラー: 重複したemailが存在する', async () => {
    const unValidatedInput = {
      kind: 'UnValidated' as const,
      username: 'username',
      email: 'email@example.com',
      password: 'password',
    };
    const result = await validateUser(duplicatedEmailExists)(unValidatedInput);
    expect(result._unsafeUnwrapErr()).toStrictEqual(new ValidationError('The email already exists'));
  });

  it('エラー: ユーザー名が未入力', async () => {
    const unValidatedInput = {
      kind: 'UnValidated' as const,
      username: '',
      email: 'email@example.com',
      password: 'password',
    };
    const result = await validateUser(noDuplicatedEmailExists)(unValidatedInput);
    expect(result._unsafeUnwrapErr()).toStrictEqual(new ValidationError('Username must be at least 1 character long'));
  });

  it('エラー: emailの形式誤り', async () => {
    const unValidatedInput = {
      kind: 'UnValidated' as const,
      username: 'username',
      email: 'email',
      password: 'password',
    };
    const result = await validateUser(noDuplicatedEmailExists)(unValidatedInput);
    expect(result._unsafeUnwrapErr()).toStrictEqual(new ValidationError('Email is invalid'));
  });

  it('エラー: パスワードが文字数不足', async () => {
    const unValidatedInput = {
      kind: 'UnValidated' as const,
      username: 'username',
      email: 'email@example.com',
      password: 'pass',
    };
    const result = await validateUser(noDuplicatedEmailExists)(unValidatedInput);
    expect(result._unsafeUnwrapErr()).toStrictEqual(new ValidationError('Password must be at least 5 characters long'));
  });
});
