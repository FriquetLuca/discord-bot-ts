/**
 * Represent the type of any function type
 */
export type AnyFunction = (...arg: any) => any
/**
 * Unpack the type of an array T, otherwise T
 */
export type Unpack<T> = T extends (infer A)[] ? A : T
/**
 * Represent the constructor type
 */
export type Constructor<T> = new (...args: any[]) => T
/**
 * Allow the properties of an object type to be mutable
 */
export type Mutable<T> = { -readonly [K in keyof T]: T[K] }
/**
 * Allow a deep freeze of all properties of an object type
 */
export type DeepReadonly<T> = { readonly [K in keyof T]: DeepReadonly<T[K]> }
/**
 * Allow a deep mutation into an object type
 */
export type DeepMutable<T> = { -readonly [K in keyof T]: DeepMutable<T[K]> }
/**
 * Allow a deep merge of an object type
 */
export type DeepMerge<T extends object[], Rest = {}> = T extends [infer L, ...infer R extends object[]]
  ? DeepMerge<R, Omit<Rest, keyof L> & { 
      [p in keyof L]: p extends keyof Rest ? L[p] | Rest[p] : L[p] 
    }>
  : Omit<Rest, never>
/**
 * Find the first element in a tuple type
 */
export type FirstInTuple<T extends any[]> = T extends [any, ...infer R]
  ? T extends [...infer F, ...R]
    ? F
    : never
  : never
/**
 * Omit the first argument of a function type
 */
export type OmitFirstArg<F> = F extends (x: any, ...args: infer P) => infer R ? (...args: P) => R : never
/**
 * Override the return type of a function type
 */
export type OverrideReturnType<F, O> = F extends (...args: infer P) => infer _ ? (...args: P) => O : never
/**
 * Collapse the structure of a type
 */
export type Collapse<T> = T extends (...args: any[]) => any
  ? T
  : T extends object
    ? { [K in keyof T]: Collapse<T[K]> }
    : T