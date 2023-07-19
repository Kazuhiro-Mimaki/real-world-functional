import type { PrismaClient } from '@prisma/client';
import { z } from 'zod';

/**
 * Constrained to be nonempty string
 */
export const NonemptyString = z.string().min(1);
export type NonemptyString = Branded<z.infer<typeof NonemptyString>, 'NonemptyString'>;

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

export type ApplicationContext = {
  prisma: PrismaClient;
};
