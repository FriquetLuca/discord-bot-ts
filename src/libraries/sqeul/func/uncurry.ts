import type { Unpack } from "@/libraries/types"
import { getTypeof } from "@/libraries/typeof"

export type Uncurry<T extends (...args: any) => any, Rest extends any[] = []> = ReturnType<T> extends (...args: any) => any
  ? Uncurry<ReturnType<T>, [...Rest, Unpack<Parameters<T>>]>
  : (...args: [...Rest, Unpack<Parameters<T>>]) => ReturnType<T>
/**
 * Unnest a sequence of function as arguments for a single function
 * @param fn The function to unnest
 * @returns The new function that can be called without the nesting
 */
export function uncurry<T extends (...args: any) => any>(fn: T) {
  return (...args: Parameters<Uncurry<T>>): ReturnType<Uncurry<T>> => {
    if((args as any[]).length === 0) {
      return fn()
    }
    let initial = fn((args as any[])[0])
    for(let i = 1; i < (args as any[]).length; i++) {
      if(getTypeof(initial) === "function") {
        initial = initial((args as any[])[i])
      } else {
        return initial
      }
    }
    return initial
  }
}
