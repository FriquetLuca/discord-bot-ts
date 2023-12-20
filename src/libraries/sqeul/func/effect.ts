import { execute } from "./execute"
import { matchExecute } from "./matchExecute";

type DefinedOrElse<T, Fallback> = T extends undefined ? Fallback : T;

/**
 * Create an effect on a function to handle any error that might occurs in a safe way or the result itself if it's successful
 * @param fn The function to apply an effect to
 * @param match The matcher with a `SUCCESS` and `ERROR` method entirely optional
 * @returns The effect function
 */
export function effect<
  T extends (...args: any) => any,
  U extends Error,
  Succ extends (value: ReturnType<T>) => ReturnType<T>,
  Err extends (error: U) => ReturnType<T> | U
>(fn: T, match?: {
  SUCCESS?: Succ,
  ERROR?: Err
}): (...args: Parameters<T>) => DefinedOrElse<ReturnType<Succ>, ReturnType<T>> | DefinedOrElse<ReturnType<Err>, U>
{
  return (...args: Parameters<T>) => matchExecute(execute<U, T>(fn, ...args), match) as any
}
