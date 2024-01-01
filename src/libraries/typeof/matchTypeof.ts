import type { AnyFunction } from "@/libraries/types"
import { getTypeof } from "./getTypeof"

export type TypeMatcher<Result> = Partial<{
  null: () => Result
  undefined: () => Result
  date: (item: Date) => Result
  string: (item: string) => Result
  boolean: (item: boolean) => Result
  bigint: (item: bigint) => Result
  number: (item: number) => Result
  object: (item: object) => Result
  array: (item: unknown[]) => Result
  class: (item: new (...args: any[]) => any) => Result
  function: (item: AnyFunction) => Result
  error: (item: Error) => Result
}>

type MatchingResult<T, Matcher> = Matcher[keyof Matcher] extends undefined
  ? T
  : Matcher[keyof Matcher] extends (...args: any[]) => infer R
    ? R
    : T
/**
 * Allows the modification of a specific value if it's type match with the matcher
 * @param parameter The parameter whose type is going to determine how it's going to be handled
 * @param match The matcher for the parameter
 */
export function matchTypeof<T, U, Matcher extends TypeMatcher<U>>(parameter: T, match: Matcher): MatchingResult<T, Matcher> | undefined {
  const t = match[getTypeof(parameter) as keyof typeof match]
  if(t === undefined) {
    return undefined
  }
  return (t as AnyFunction)(parameter)
}
