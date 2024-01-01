import type { FirstInTuple } from "@/libraries/types"
import { fromResult, type Result } from "./fromResult"
import { ensureError } from "./func/ensureError"

export type CurryingFunctor<F, Err extends Error> = F extends (...args: infer Args) => infer Return
  ? Args['length'] extends 0 | 1
    ? (...args: Args) => Result<Return, Err>
    : Args extends [any, ...infer Rest]
    ? (...args: FirstInTuple<Args>) => CurryingFunctor<(...rest: Rest) => Return, Err>
    : never
  : never

function curryFunctor<T extends any[], R, Err extends Error>(fn: (...args: T) => R, depth = 0, ...rest: any[]): CurryingFunctor<typeof fn, Err> {
  if(depth < fn.length) {
    const carryOver = (item: T[typeof depth]) => {
      return curryFunctor(fn, depth + 1, ...[...rest, item])
    }
    return carryOver as CurryingFunctor<T, Err>
  }
  return fromFunction(fn).execute(...rest as T) as CurryingFunctor<T, Err>
}

/**
 * The type representation around a nice wrapper for a function.
 */
export type Functor<T extends (...args: any) => any, U extends Error = Error> = {
  /**
   * Translate a function that takes multiple arguments into evaluating a sequence of functions, each with a single argument
   */
  currying: CurryingFunctor<T, U>
  /**
   * Execute a function and wrap it's result or error into a Result type.
   * @param args The parameters of the functor.
   */
  execute: (...args: Parameters<T>) => Result<ReturnType<T>, U>
  /**
   * Create a composition of two functions using the mathematical standard of function composition, evaluating from right to left. (f1 ○ f2)(x) = f1(f2(x))
   * @param fn2 The function to compose with
   */
  composeRight: <T2 extends (...args: any) => Parameters<T>, Err2 extends Error = Error>(fn2: T2) => Functor<(...args: Parameters<T2>) => ReturnType<T>, U | Err2>
  /**
   * Create a composition of two functions evaluating from left to right. (f1 ○ f2)(x) = f2(f1(x))
   * @param fn2 The function to compose with
   */
  composeLeft: <T2 extends (arg: ReturnType<T>) => any, Err2 extends Error = Error>(fn2: T2) => Functor<(...args: Parameters<T>) => ReturnType<T2>, U | Err2>
}

/**
 * A functor wrapper for a function.
 * @param fn The function to handle.
 */
export function fromFunction<T extends (...args: any) => any, U extends Error = Error>(fn: T): Functor<T, U> {
  
  return {
    currying: curryFunctor<Parameters<T>, ReturnType<T>, U>(fn) as CurryingFunctor<T, U>,
    composeRight: <T2 extends (...args: any) => Parameters<T>, Err2 extends Error = Error>(fn2: T2) => fromFunction<(...args: Parameters<T2>) => ReturnType<T>, U | Err2>((...args: Parameters<T2>) => fn(fn2(args))),
    composeLeft: <T2 extends (arg: ReturnType<T>) => any, Err2 extends Error = Error>(fn2: T2) => fromFunction<(...args: Parameters<T>) => ReturnType<T2>, U | Err2>((...args: Parameters<T>) => fn2(fn(args))),
    execute: (...args: Parameters<T>) => {
      try {
        return fromResult<ReturnType<T>, U>({
          success: true,
          value: fn(args)
        })
      } catch (e: unknown) {
        return fromResult<ReturnType<T>, U>({
          success: false,
          error: ensureError<U>(e)
        })
      }
    },
  }
}
