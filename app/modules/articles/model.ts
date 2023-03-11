import type { Article as ArticleModel } from '@prisma/client';
import { Result } from 'neverthrow';
import { ArticleId, Content, Title } from './vo';

/**
 * Article
 */
export type Article = {
  readonly id: ArticleId;
  readonly title: Title;
  readonly content: Content;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};
export const Article = (article: ArticleModel): Result<Article, Error> => {
  const articleId = ArticleId(article.id);
  const title = Title(article.title);
  const content = Content(article.content);

  const values = Result.combine([articleId, title, content]);
  return values.map(([articleId, title, content]) => ({
    id: articleId,
    title: title,
    content: content,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
  }));
};
