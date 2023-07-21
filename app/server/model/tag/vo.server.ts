import type { Result } from 'neverthrow';
import { err, ok } from 'neverthrow';
import { NonemptyString } from '../baseTypes.server';
import { ValidationError } from '~/utils/error';

/**
 * TagId
 */
export type TagId = Branded<number, 'TagId'>;
export const TagId = (input: number): Result<TagId, ValidationError> => {
  return ok(input as TagId);
};

/**
 * TagName
 */
export type TagName = Branded<string, 'TagName'>;
export const TagName = (input: string): Result<TagName, ValidationError> => {
  const parsed = NonemptyString.safeParse(input);
  return parsed.success
    ? ok(parsed.data as TagName)
    : err(new ValidationError('Tag name must be at least 5 characters long', { cause: parsed.error }));
};
