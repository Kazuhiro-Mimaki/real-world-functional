import type { Tag } from '../tag';
import type { User } from '../user';

/**
 * Article
 */
export type Article = {
  readonly id: string;
  readonly title: string;
  readonly content: string;
  readonly author: User;
  readonly tags: Tag[];
};
