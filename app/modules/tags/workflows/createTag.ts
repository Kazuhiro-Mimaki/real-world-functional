import { Result } from 'neverthrow';
import { ok } from 'neverthrow';
import { TagName } from '../vo';

// ====================
// Type
// ====================

type UnValidatedTag = {
  kind: 'UnValidated';
  name: string;
};

type ValidatedTag = {
  kind: 'Validated';
  name: TagName;
};

export type CreatedTag = {
  kind: 'Created';
  name: TagName;
};

// ====================
// step1
// ====================

export type ValidateTag = (model: UnValidatedTag) => Result<ValidatedTag, Error>;
export const validateTag: ValidateTag = (model: UnValidatedTag): Result<ValidatedTag, Error> => {
  const name = TagName(model.name);

  const values = Result.combine([name]);

  return values.map(([name]) => ({
    kind: 'Validated',
    name,
  }));
};

// ====================
// step2
// ====================

export type CreateTag = (model: ValidatedTag) => Result<CreatedTag, Error>;
export const createTag: CreateTag = (model: ValidatedTag) => {
  return ok({
    ...model,
    kind: 'Created',
  });
};
