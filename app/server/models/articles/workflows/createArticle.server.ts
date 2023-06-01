import { Result } from 'neverthrow';
import type { ResultAsync } from 'neverthrow';
import { ok } from 'neverthrow';
import { Content, Title } from '../vo.server';
import type { Article } from '../model.server';
import { UserId } from '../../users/vo.server';
import type { SaveArticle } from '../repository.server';
import { TagName } from '~/server/models/tags/vo.server';

// ====================
// Type
// ====================

type UnValidatedArticle = {
  kind: 'UnValidated';
  title: string;
  content: string;
  tagNames: string[];
  authorId: number;
};

type ValidatedArticle = {
  kind: 'Validated';
  title: Title;
  content: Content;
  tagNames: TagName[];
  authorId: UserId;
};

export type CreatedArticle = {
  kind: 'Created';
  title: Title;
  content: Content;
  tagNames: TagName[];
  authorId: UserId;
};

// ====================
// step1
// ====================

export type ValidateArticle = (model: UnValidatedArticle) => Result<ValidatedArticle, Error>;
export const validateArticle: ValidateArticle = (model: UnValidatedArticle): Result<ValidatedArticle, Error> => {
  const title = Title(model.title);
  const content = Content(model.content);
  const tagNames = Result.combine(model.tagNames.map((v) => TagName(v)));
  const authorId = UserId(model.authorId);

  const values = Result.combine([title, content, tagNames, authorId]);

  return values.map(([title, content, tagNames, authorId]) => ({
    kind: 'Validated',
    title,
    content,
    tagNames,
    authorId,
  }));
};

// ====================
// step2
// ====================

export type CreateArticle = (model: ValidatedArticle) => Result<CreatedArticle, Error>;
export const createArticle: CreateArticle = (model: ValidatedArticle) => {
  return ok({
    ...model,
    kind: 'Created',
  });
};

// ====================
// step3
// ====================

export type SaveCreatedArticle = (model: CreatedArticle) => ResultAsync<Article, Error>;
export const saveCreatedArticle =
  (saveArticle: SaveArticle): SaveCreatedArticle =>
  (model: CreatedArticle) =>
    ok(model).asyncAndThen(saveArticle);

// ====================
// workflow
// ====================

export type CreateArticleWorkFlow = (model: UnValidatedArticle) => ResultAsync<Article, Error>;
export const createArticleWorkFlow =
  (saveArticle: SaveArticle): CreateArticleWorkFlow =>
  (model: UnValidatedArticle) =>
    ok(model).andThen(validateArticle).andThen(createArticle).asyncAndThen(saveCreatedArticle(saveArticle));
