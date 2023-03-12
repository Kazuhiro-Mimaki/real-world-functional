import { Result, ResultAsync } from 'neverthrow';
import { db } from '~/server/db.server';
import { Article } from './model';
import type { CreatedArticle } from './workflows/createArticle';

/**
 * save article in db
 */
export type SaveArticle = (createdArticle: CreatedArticle) => ResultAsync<Article, Error>;
export const saveArticle: SaveArticle = ({ title, content, userId }: CreatedArticle) => {
  return ResultAsync.fromPromise(
    db.article.create({
      data: { title, content, authorId: userId },
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
export const listArticles: ListArticles = () => {
  return ResultAsync.fromPromise(
    db.article.findMany({
      include: {
        author: true,
      },
    }),
    () => new Error('Fail to get articles from database')
  ).andThen((articles) => Result.combine(articles.map((v) => Article(v))));
};
