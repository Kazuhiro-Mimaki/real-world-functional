import type { Article as ArticleSchema, User as UserSchema, Tag as TagPrisma } from '@prisma/client';
import { Result } from 'neverthrow';
import { Tag } from '../tag/model.server';
import { User } from '../user/model.server';
import { ArticleId, Content, Title } from './vo.server';
import type { ValidationError } from '~/utils/error';

/**
 * Article
 */
export type Article = {
  readonly id: ArticleId;
  readonly title: Title;
  readonly content: Content;
  readonly author: User;
  readonly tags: Tag[];
};
export const Article = (
  article:
    | (ArticleSchema & {
        author: UserSchema;
        tags: TagPrisma[];
      })
    | Article
): Result<Article, ValidationError> => {
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
    author: author,
    tags: tags,
  }));
};
