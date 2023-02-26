import { z } from 'zod';

/**
 * Constrained to be 5 chars or less, not null
 */
export const String5 = z.string().min(5);
export type String5 = z.infer<typeof String5>;

/**
 * An email address
 */
export const Email = z.string().email();
export type Email = z.infer<typeof Email>;
