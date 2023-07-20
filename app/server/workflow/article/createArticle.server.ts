import { Result, ok } from 'neverthrow';
import { Content, Title } from '~/server/model/article';
import { UserId } from '~/server/model/user';
import { TagName } from '~/server/model/tag';

// ====================
// Type
// ====================

type UnValidatedArticle = {
  kind: 'UnValidated';
  title: string;
  content: string;
  tagNames: string[];
  authorId: string;
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
// workflow
// ====================

type ValidateArticle = (model: UnValidatedArticle) => Result<ValidatedArticle, Error>;
const validateArticle: ValidateArticle = (model: UnValidatedArticle) => {
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

type CreateArticle = (model: ValidatedArticle) => Result<CreatedArticle, Error>;
const createArticle: CreateArticle = (model: ValidatedArticle) => {
  return ok({
    ...model,
    kind: 'Created',
  });
};

type CreateArticleWorkFlow = (model: UnValidatedArticle) => Result<CreatedArticle, Error>;
export const createArticleWorkFlow = (): CreateArticleWorkFlow => (model: UnValidatedArticle) =>
  ok(model).andThen(validateArticle).andThen(createArticle);
