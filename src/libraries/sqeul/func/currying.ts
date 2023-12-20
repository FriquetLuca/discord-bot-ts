type FirstAsTuple<T extends any[]> = T extends [any, ...infer R]
  ? T extends [...infer F, ...R]
    ? F
    : never
  : never

export type Currying<F> = F extends (...args: infer Args) => infer Return
  ? Args['length'] extends 0 | 1
    ? F
    : Args extends [any, ...infer Rest]
    ? (...args: FirstAsTuple<Args>) => Currying<(...rest: Rest) => Return>
    : never
  : never
/**
 * Translate a function that takes multiple arguments into evaluating a sequence of functions, each with a single argument
 * @param fn The base function
 * @returns The sequence of functions for each argument
 */
export function currying<T extends any[], R>(fn: (...args: T) => R, depth = 0, ...rest: any[]): Currying<typeof fn> {
  if(depth < fn.length) {
    const carryOver = (item: T[typeof depth]) => {
      return currying(fn, depth + 1, ...[...rest, item])
    }
    return carryOver as Currying<T>
  }
  return fn(...rest as T) as Currying<T>
}
