import type { Result } from "@/libraries/types"

type ErrorType<T, U extends Error, V extends (error: U) => T|U, W extends {
  SUCCESS?: (value: T) => T,
  ERROR?: V
}> = W["ERROR"] extends V ? ReturnType<W["ERROR"]> : U;

/**
 * Apply a matcher on a result to handle it in a safe way
 * @param result The result to handle
 * @param match The matcher for the result
 * @returns The value handled by the matcher
 */
export function matchExecute<T, U extends Error, V extends (error: U) => T|U, W extends {
  SUCCESS?: (value: T) => T,
  ERROR?: V
}>(result: Result<T, U>, match?: W): (typeof result)["success"] extends true
  ? T
  : (typeof result)["success"] extends false
    ? ErrorType<T, U, V, W>
    : (T | ErrorType<T, U, V, W>)
  {
  if(result.success) {
    return (match?.SUCCESS ? match.SUCCESS(result.value) : result.value) as any
  }
  return ((match?.ERROR && match.ERROR(result.error)) ?? result.error) as any
}
