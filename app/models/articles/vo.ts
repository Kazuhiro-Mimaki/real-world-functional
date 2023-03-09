import type { Result } from 'neverthrow';
import { err, ok } from 'neverthrow';
import type { Branded } from '../baseTypes';
import { NonemptyString } from '../baseTypes';

/**
 * ArticleId
 */
export type ArticleId = Branded<number, 'ArticleId'>;
export const ArticleId = (input: number): Result<ArticleId, Error> => {
  return ok(input as ArticleId);
};

/**
 * Title
 */
export type Title = Branded<string, 'Title'>;
export const Title = (input: string): Result<Title, Error> => {
  const parsed = NonemptyString.safeParse(input);
  return parsed.success ? ok(parsed.data as Title) : err(new Error('Title must be at least 5 characters long'));
};

/**
 * Content
 */
export type Content = Branded<string, 'Content'>;
export const Content = (input: string): Result<Content, Error> => {
  const parsed = NonemptyString.safeParse(input);
  return parsed.success ? ok(parsed.data as Content) : err(new Error('Content must be at least 5 characters long'));
};
