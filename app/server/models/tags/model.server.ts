import type { Tag as TagPrisma } from '@prisma/client';
import { Result } from 'neverthrow';
import { TagId, TagName } from './vo.server';

/**
 * Tag
 */
export type Tag = {
  readonly id: TagId;
  readonly name: TagName;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};
export const Tag = (tag: TagPrisma): Result<Tag, Error> => {
  const id = TagId(tag.id);
  const name = TagName(tag.name);

  const values = Result.combine([id, name]);
  return values.map(([id, name]) => ({
    ...tag,
    id: id,
    name: name,
  }));
};
