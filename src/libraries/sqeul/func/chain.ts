import { Collapse, OmitFirstArg, OverrideReturnType } from "@/libraries/types"

export type Chain<T extends Record<string, (arg: U, ...args: any) => any>, U extends {}> = {
  [K in keyof T]: OverrideReturnType<OmitFirstArg<T[K]>, Chain<T, Collapse<U & ReturnType<OmitFirstArg<T[K]>>>>>
} & {
  /**
   * Get the currently built object
   * @returns The created object
   */
  get: () => U
}

function chain<T extends Record<string, (arg: U, ...args: any) => any>, U extends {}>(fns: T, arg: U) {
  const patchFns = {} as any
  for(const fnKey in fns) {
    const fn = fns[fnKey]
    patchFns[fnKey] = (...args: any) => chain(fns, fn(arg, ...args))
  }
  return {
    ...patchFns,
    get: () => arg,
  } as Chain<T, U>
}

/**
 * Allows the creation of chaining methods to create an object.
 * ```ts
 * const chainExample = chaining({
 *  min: (arg: {}, minValue: number) => ({
 *   ...arg,
 *   min: minValue
 *  }),
 * max: (arg: {}, maxValue: number) => ({
 *   ...arg,
 *   max: maxValue
 *  })
 * })
 * ```
 * @param fns The record of functions to execute
 * @returns The chaining object
 */
export function chaining<T extends Record<string, (...args: any) => any>>(fns: T) {
  return chain(fns, {})
}
