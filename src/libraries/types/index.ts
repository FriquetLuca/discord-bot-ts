/**
 * Represent the type of any function
 */
export type AnyFunction = (arg: any) => any
/**
 * Unpack the type of an array T, otherwise T
 */
export type Unpack<T> = T extends (infer A)[] ? A : T
/**
 * A generic Result type
 */
export type Result<T, U extends Error = Error> = {
  success: true,
  value: T
} | {
  success: false,
  error: U
}
/**
 * Represent the constructor type
 */
export type Constructor<T> = new (...args: any[]) => T
/**
 * Allow the properties of an object to be mutable
 */
export type Mutable<T> = { -readonly [K in keyof T]: T[K] }
/**
 * Allow a deep freeze of all properties of an object
 */
export type DeepReadonly<T> = { readonly [K in keyof T]: DeepReadonly<T[K]> }
/**
 * Allow a deep mutation into an object
 */
export type DeepMutable<T> = { -readonly [K in keyof T]: DeepMutable<T[K]> }
/**
 * Allow a deep merge of an object
 */
export type DeepMerge<T extends object[], Rest = {}> = T extends [infer L, ...infer R extends object[]]
    ? DeepMerge<R, Omit<Rest, keyof L> & { 
        [p in keyof L]: p extends keyof Rest ? L[p] | Rest[p] : L[p] 
      }>
    : Omit<Rest, never>
