import type { AnyFunction } from "@/libraries/types";

type Lookup<T, K extends keyof any, Else = never> = K extends keyof T
  ? T[K]
  : Else
type Tail<T extends any[]> = ((...t: T) => void) extends ((x: any, ...u: infer U) => void)
  ? U
  : never
type ArgType<F, Else = never> = F extends (arg: infer A) => any ? A : Else
export type FunctionAsChain<F extends [AnyFunction, ...AnyFunction[]], G extends AnyFunction[]= Tail<F>> = { [K in keyof F]: (arg: ArgType<F[K]>) => ArgType<Lookup<G, K, any>, any> }
export type LastIndexOfFunctionArray<T extends any[]> = ((...x: T) => void) extends ((y: any, ...z: infer U) => void)
  ? U['length']
  : never
/**
 * Create a composition of many functions
 * @param fns The functions to compose
 * @returns A function that's the composition of all functions added
 */
export function compose<F extends [AnyFunction, ...Array<AnyFunction>]>(
  ...fns: F & FunctionAsChain<F>
) {
  return (arg: ArgType<F[0]>) => (fns as Function[]).reduce((acc, fn) => fn(acc), arg) as ReturnType<F[LastIndexOfFunctionArray<F>]>
}
