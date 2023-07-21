import type { Tag as TagSchema } from '@prisma/client';
import { Result } from 'neverthrow';
import { TagId, TagName } from './vo.server';
import type { ValidationError } from '~/utils/error';

/**
 * Tag
 */
export type Tag = {
  readonly id: TagId;
  readonly name: TagName;
};
export const Tag = (tag: TagSchema | Tag): Result<Tag, ValidationError> => {
  const id = TagId(tag.id);
  const name = TagName(tag.name);

  const values = Result.combine([id, name]);
  return values.map(([id, name]) => ({
    ...tag,
    id: id,
    name: name,
  }));
};
