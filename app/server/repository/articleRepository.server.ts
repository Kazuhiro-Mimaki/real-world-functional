import { Result, ResultAsync, ok } from 'neverthrow';
import { Article } from '~/server/model/article/model.server';
import type { CreatedArticle } from '~/server/workflow/article';
import type { ApplicationContext } from '~/server/model/baseTypes.server';
import type { ArticleId } from '~/server/model/article';
import type { ValidationError } from '~/utils/error';
import { PrismaClientError } from '~/utils/error';

/**
 * save article
 */
export type SaveArticle = (createdArticle: CreatedArticle) => ResultAsync<Article, PrismaClientError | ValidationError>;
export const saveArticle =
  ({ prisma }: ApplicationContext): SaveArticle =>
  ({ title, content, tagNames, authorId }: CreatedArticle) => {
    return ResultAsync.fromPromise(
      prisma.article.create({
        data: {
          title: title,
          content: content,
          tags: { create: tagNames.map((v) => ({ name: v })) },
          authorId: authorId,
        },
        include: {
          author: true,
          tags: true,
        },
      }),
      (err) => new PrismaClientError('Prisma error', { cause: err })
    ).andThen((article) => Article(article));
  };

/**
 * find articles
 */
export type FindArticles = () => ResultAsync<Article[], PrismaClientError | ValidationError>;
export const findArticles =
  ({ prisma }: ApplicationContext): FindArticles =>
  () => {
    return ResultAsync.fromPromise(
      prisma.article.findMany({
        include: {
          author: true,
          tags: true,
        },
      }),
      (err) => new PrismaClientError('Prisma error', { cause: err })
    ).andThen((articles) => Result.combine(articles.map((v) => Article(v))));
  };

/**
 * find article
 */
export type FindArticle = (articleId: ArticleId) => ResultAsync<Article | null, PrismaClientError | ValidationError>;
export const findArticle =
  ({ prisma }: ApplicationContext): FindArticle =>
  (articleId: ArticleId) => {
    return ResultAsync.fromPromise(
      prisma.article.findFirst({
        where: { id: articleId },
        include: {
          author: true,
          tags: true,
        },
      }),
      (err) => new PrismaClientError('Prisma error', { cause: err })
    ).andThen((article) => (article ? Article(article) : ok(null)));
  };
