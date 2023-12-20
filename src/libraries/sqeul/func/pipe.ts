import type { AnyFunction, Unpack } from "@/libraries/types";
import type { FunctionAsChain, LastIndexOfFunctionArray } from "./compose";

/**
 * Combines multiple functions into a single function chain, applying them from left to right.
 * @param arg - The initial argument to be passed through the function chain.
 * @param fns - A tuple of functions to be applied in order.
 * @returns The result of applying all functions in the chain.
 * 
 * @example
 * ```typescript
 * const result = pipe(2, addOne, double); // equivalent to: double(addOne(2))
 * ```
 */
export function pipe<F extends [AnyFunction, ...Array<AnyFunction>]>(
  arg: Unpack<Parameters<F[0]>>,
  ...fns: F & FunctionAsChain<F>
) {
  return (fns as Function[]).reduce((acc, fn) => fn(acc), arg) as ReturnType<F[LastIndexOfFunctionArray<F>]>
}
