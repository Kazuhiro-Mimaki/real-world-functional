import type { Article as ArticlePrisma, User as UserPrisma, Tag as TagPrisma } from '@prisma/client';
import { Result } from 'neverthrow';
import { Tag } from '../tag/model.server';
import { User } from '../user/model.server';
import { ArticleId, Content, Title } from './vo.server';

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
  readonly tags: Tag[];
};
export const Article = (
  article: ArticlePrisma & {
    author: UserPrisma;
    tags: TagPrisma[];
  }
): Result<Article, Error> => {
  const articleId = ArticleId(article.id);
  const title = Title(article.title);
  const content = Content(article.content);
  const author = User(article.author);
  const tags = Result.combine(article.tags.map((v) => Tag(v)));

  const values = Result.combine([articleId, title, content, author, tags]);
  return values.map(([articleId, title, content, author, tags]) => ({
    id: articleId,
    title: title,
    content: content,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    author: author,
    tags: tags,
  }));
};
