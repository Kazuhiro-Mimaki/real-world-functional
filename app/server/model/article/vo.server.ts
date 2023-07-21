import type { Result } from 'neverthrow';
import { err, ok } from 'neverthrow';
import { NonemptyString } from '../baseTypes.server';
import { ValidationError } from '~/utils/error';

/**
 * ArticleId
 */
export type ArticleId = Branded<number, 'ArticleId'>;
export const ArticleId = (input: number): Result<ArticleId, ValidationError> => {
  return ok(input as ArticleId);
};

/**
 * Title
 */
export type Title = Branded<string, 'Title'>;
export const Title = (input: string): Result<Title, ValidationError> => {
  const parsed = NonemptyString.safeParse(input);
  return parsed.success
    ? ok(parsed.data as Title)
    : err(new ValidationError('Title must be at least 5 characters long', { cause: parsed.error }));
};

/**
 * Content
 */
export type Content = Branded<string, 'Content'>;
export const Content = (input: string): Result<Content, ValidationError> => {
  const parsed = NonemptyString.safeParse(input);
  return parsed.success
    ? ok(parsed.data as Content)
    : err(new ValidationError('Content must be at least 5 characters long', { cause: parsed.error }));
};
