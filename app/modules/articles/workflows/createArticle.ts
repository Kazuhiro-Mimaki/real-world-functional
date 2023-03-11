import { Result } from 'neverthrow';
import type { ResultAsync } from 'neverthrow';
import { ok } from 'neverthrow';
import { Content, Title } from '../vo';
import type { Article } from '../model';
import { UserId } from '../../users/vo';
import type { SaveArticle } from '../repository';

// ====================
// Type
// ====================

type UnValidatedArticle = {
  kind: 'UnValidated';
  title: string;
  content: string;
  userId: number;
};

type ValidatedArticle = {
  kind: 'Validated';
  title: Title;
  content: Content;
  userId: UserId;
};

export type CreatedArticle = {
  kind: 'Created';
  title: Title;
  content: Content;
  userId: UserId;
};

// ====================
// step1
// ====================

export type ValidateArticle = (model: UnValidatedArticle) => Result<ValidatedArticle, Error>;
export const validateArticle = (model: UnValidatedArticle): Result<ValidatedArticle, Error> => {
  const title = Title(model.title);
  const content = Content(model.content);
  const userId = UserId(model.userId);

  const values = Result.combine([title, content, userId]);

  return values.map(([title, content, userId]) => ({
    kind: 'Validated',
    title,
    content,
    userId,
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
export const saveCreatedUser =
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
    ok(model).andThen(validateArticle).andThen(createArticle).asyncAndThen(saveArticle);
