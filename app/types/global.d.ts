/**
 * request context
 */
declare type RequestContext<Input> = {
  userId: number;
  input: Input;
};

/**
 * branded
 */
declare type Branded<T, K> = T & { __brand: K };
