import { err, ok, type ResultAsync } from 'neverthrow';
import { findArticles, findArticle } from '~/server/repository';
import type { ApplicationContext } from '~/server/model/baseTypes.server';
import type { Article, ArticleId } from '~/server/model/article';
import { ResourceNotFoundError } from '~/utils/error';
import type { ValidationError } from '~/utils/error';
import type { PrismaClientError } from '~/utils/error';

/**
 * get articles
 */
type GetArticles = () => ResultAsync<Article[], PrismaClientError | ValidationError>;
export const getArticles =
  (context: ApplicationContext): GetArticles =>
  () =>
    findArticles(context)();

/**
 * get article
 */
type GetArticle = (
  articleId: ArticleId
) => ResultAsync<Article, PrismaClientError | ValidationError | ResourceNotFoundError>;
export const getArticle =
  (context: ApplicationContext): GetArticle =>
  (articleId: ArticleId) =>
    findArticle(context)(articleId).andThen((article) =>
      article ? ok(article) : err(new ResourceNotFoundError('Article not found'))
    );
