import { Result, ResultAsync } from 'neverthrow';
import { Article } from '~/server/model/article/model.server';
import type { CreatedArticle } from '~/server/workflow/article';
import type { ApplicationContext } from '~/server/model/baseTypes.server';

/**
 * save article
 */
export type SaveArticle = (createdArticle: CreatedArticle) => ResultAsync<Article, Error>;
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
      () => new Error('Prisma error')
    ).andThen((article) => Article(article));
  };

/**
 * find articles
 */
export type FindArticles = () => ResultAsync<Article[], Error>;
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
      () => new Error('Prisma error')
    ).andThen((articles) => Result.combine(articles.map((v) => Article(v))));
  };
