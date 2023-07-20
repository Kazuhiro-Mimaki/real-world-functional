/**
 * request context
 */
declare type RequestContext<Input> = {
  userId: string;
  input: Input;
};

/**
 * branded
 */
declare type Branded<T, K> = T & { __brand: K };
