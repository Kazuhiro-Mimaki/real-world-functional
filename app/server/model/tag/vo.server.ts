import type { Result } from 'neverthrow';
import { err, ok } from 'neverthrow';
import type { Branded } from '../baseTypes.server';
import { NonemptyString } from '../baseTypes.server';

/**
 * TagId
 */
export type TagId = Branded<number, 'TagId'>;
export const TagId = (input: number): Result<TagId, Error> => {
  return ok(input as TagId);
};

/**
 * TagName
 */
export type TagName = Branded<string, 'TagName'>;
export const TagName = (input: string): Result<TagName, Error> => {
  const parsed = NonemptyString.safeParse(input);
  return parsed.success ? ok(parsed.data as TagName) : err(new Error('Tag name must be at least 5 characters long'));
};
