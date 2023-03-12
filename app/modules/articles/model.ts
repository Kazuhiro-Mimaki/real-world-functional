import type { Article as ArticlePrisma, User as UserPrisma } from '@prisma/client';
import { Result } from 'neverthrow';
import { User } from '../users/model';
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
  readonly author: User;
};
export const Article = (
  article: ArticlePrisma & {
    author: UserPrisma;
  }
): Result<Article, Error> => {
  const articleId = ArticleId(article.id);
  const title = Title(article.title);
  const content = Content(article.content);
  const author = User(article.author);

  const values = Result.combine([articleId, title, content, author]);
  return values.map(([articleId, title, content, author]) => ({
    id: articleId,
    title: title,
    content: content,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    author: author,
  }));
};
