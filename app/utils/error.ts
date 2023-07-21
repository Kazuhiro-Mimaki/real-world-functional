/**
 * Base error class
 */
class BaseError extends Error {
  readonly cause?: unknown;

  constructor(message: string, options?: { cause: unknown }) {
    super(message);
    this.cause = options?.cause;
  }
}

/**
 * Error with authorization
 */
export class AuthorizationError extends BaseError {
  override readonly name = 'AuthorizationError' as const;
  constructor(message: string, options?: { cause: unknown }) {
    super(message, options);
  }
}

/**
 * Error with data validation
 */
export class ValidationError extends BaseError {
  override readonly name = 'ValidationError' as const;
  constructor(message: string, options?: { cause: unknown }) {
    super(message, options);
  }
}

/**
 * Error with resource not found
 */
export class ResourceNotFoundError extends BaseError {
  override readonly name = 'ResourceNotFoundError' as const;
  constructor(message: string, options?: { cause: unknown }) {
    super(message, options);
  }
}

/**
 * Error with prisma client
 */
export class PrismaClientError extends BaseError {
  override readonly name = 'PrismaClientError' as const;
  constructor(message: string = 'Prisma error', options?: { cause: unknown }) {
    super(message, options);
  }
}
