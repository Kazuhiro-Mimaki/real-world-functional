import { err, ok, type ResultAsync } from 'neverthrow';
import { findArticles, findArticle } from '~/server/repository';
import type { ApplicationContext } from '~/server/model/baseTypes.server';
import type { Article, ArticleId } from '~/server/model/article';

/**
 * get articles
 */
type GetArticles = () => ResultAsync<Article[], Error>;
export const getArticles =
  (context: ApplicationContext): GetArticles =>
  () =>
    findArticles(context)();

/**
 * get article
 */
type GetArticle = (articleId: ArticleId) => ResultAsync<Article, Error>;
export const getArticle =
  (context: ApplicationContext): GetArticle =>
  (articleId: ArticleId) =>
    findArticle(context)(articleId).andThen((article) => (article ? ok(article) : err(new Error('Article not found'))));
