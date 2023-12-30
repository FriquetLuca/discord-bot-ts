import type { AnyFunction } from "@/libraries/types"

export type GetTypeof<T> = T extends Error
? "error"
: T extends Date
  ? "date"
  : T extends null
    ? "null"
    : T extends undefined
    ? "undefined"
    : T extends any[]
      ? "array"
      : T extends new (...args: any[]) => any
        ? "class"
        : T extends AnyFunction
          ? "function"
          : T extends string
            ? "string"
            : T extends number
              ? "number"
              : T extends bigint
                ? "bigint"
                : T extends symbol
                  ? "symbol"
                  : T extends boolean
                    ? "boolean"
                    : T extends object
                      ? "object"
                      : "date" | "error" | "null" | "array" | "class" | "boolean" | "symbol" | "bigint" | "number" | "string" | "function" | "undefined"

/**
 * Get the type of the parameter, extending `typeof` to support `class`, `array`, `date`, `error` and `null` as native options.
 * @param parameter An unknown parameter that we want the type from.
 * @returns The type the parameter is from.
 */
export function getTypeof<T>(parameter: T): GetTypeof<T> {
  if(parameter instanceof Error) {
    return "error" as any
  }
  if(parameter instanceof Date || Object.prototype.toString.call(parameter) === "[object Date]") {
    return "date" as any
  }
  if(parameter === null) {
    return "null" as any
  }
  if(Array.isArray(parameter)) {
    return "array" as any
  }
  if(typeof parameter === "function" && /^\s*class\s+/.test(parameter.toString())) {
    return "class" as any
  }
  return typeof parameter as any
}
