import type { ResultAsync } from 'neverthrow';
import { findArticles } from '~/server/repository';
import type { ApplicationContext } from '~/server/model/baseTypes.server';
import type { Article } from '~/server/model/article';

/**
 * get articles
 */
type GetArticles = () => ResultAsync<Article[], Error>;
export const getArticles =
  (context: ApplicationContext): GetArticles =>
  () =>
    findArticles(context)();
