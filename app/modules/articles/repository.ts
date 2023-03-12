import type { PrismaClient } from '@prisma/client';
import { Result, ResultAsync } from 'neverthrow';
import { Article } from './model';
import type { CreatedArticle } from './workflows/createArticle';

/**
 * save article in db
 */
export type SaveArticle = (createdArticle: CreatedArticle) => ResultAsync<Article, Error>;
export const saveArticle =
  (prisma: PrismaClient): SaveArticle =>
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
        },
      }),
      () => new Error('Fail to save article in database')
    ).andThen((article) => Article(article));
  };

/**
 * list articles from db
 */
export type ListArticles = () => ResultAsync<Article[], Error>;
export const listArticles =
  (prisma: PrismaClient): ListArticles =>
  () => {
    return ResultAsync.fromPromise(
      prisma.article.findMany({
        include: {
          author: true,
        },
      }),
      () => new Error('Fail to get articles from database')
    ).andThen((articles) => Result.combine(articles.map((v) => Article(v))));
  };
