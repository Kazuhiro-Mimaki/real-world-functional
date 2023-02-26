import { z } from 'zod';

/**
 * Branded type
 */
export type Branded<T, K> = T & { __brand: K };

/**
 * Constrained to be 5 chars or less, not null
 */
export const String5 = z.string().min(5);
export type String5 = Branded<z.infer<typeof String5>, 'String5'>;

/**
 * An email address
 */
export const Email = z.string().email();
export type Email = Branded<z.infer<typeof Email>, 'Email'>;
