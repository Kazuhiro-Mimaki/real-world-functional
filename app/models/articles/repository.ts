import { ResultAsync } from 'neverthrow';
import { db } from '~/server/db.server';
import { Article } from './domain';
import type { CreatedArticle } from './workflows/createArticle';

/**
 * save article in db
 */
export type SaveArticle = (createdArticle: CreatedArticle) => ResultAsync<Article, Error>;
export const saveArticle: SaveArticle = ({ title, content, userId }: CreatedArticle) => {
  return ResultAsync.fromPromise(
    db.article.create({
      data: { title, content, userId },
    }),
    () => new Error('Prisma error')
  ).andThen((article) => Article(article));
};
