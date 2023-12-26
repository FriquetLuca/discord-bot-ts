import { type Maybe, maybe } from "./maybe"
import { type Perhaps, perhaps } from "./perhaps"

export type Possibly<T> = {
  readonly value: T | undefined
  readonly defaultValue: T | undefined
  isEmpty: () => boolean
  is: (compare: Possibly<T>) => boolean
  getOrDefault: () => T | undefined
  getOrElse: (defaultValue: T) => T
  get: () => T | undefined
  map: <R>(f: (wrapped: T) => R) => Possibly<R>
  flatMap: <R>(f: (wrapped: T) => Possibly<R>) => Possibly<R>
  default: () => T | undefined
  perhaps: () => Perhaps<T>
  maybe: () => Maybe<T>
  overrideEmpty: (newValue: T) => Possibly<T>
}

/**
 * Create a type that can have an optional value using undefined as not defined.
 */
export function possibly<T>(value: T | undefined = undefined, defaultValue: T | undefined = undefined): Possibly<T> {
  return {
    value,
    defaultValue,
    isEmpty: () => value === undefined,
    is: (compare) => value === compare.value,
    get: () => value,
    getOrElse: (defaultValue) => value === undefined ? defaultValue : value,
    getOrDefault: () => value === undefined ? defaultValue : value,
    overrideEmpty: (newValue: T) => value === null ? possibly(newValue) : possibly(value as T),
    map: <R>(f: (wrapped: T) => R) => value === undefined
      ? defaultValue === undefined
        ? possibly<R>(undefined)
        : possibly(f(defaultValue))
      : possibly(f(value)),
    flatMap: <R>(f: (wrapped: T) => Possibly<R>) => value === undefined
      ? defaultValue === undefined
        ? possibly<R>(undefined)
        : f(defaultValue)
      : f(value),
    default: () => defaultValue,
    perhaps: () => perhaps<T>(value, defaultValue),
    maybe: () => value !== undefined ? maybe<T>(value, defaultValue !== undefined ? defaultValue : null) : maybe<T>(null, defaultValue !== undefined ? defaultValue : null)
  }
}

export type PossiblyFactory<T> = {
  some: (value: T) => Possibly<T>,
  none: () => Possibly<T>,
  fromValue: (value: T|undefined) => Possibly<T>
}

/**
 * Create a possibly factory to generate a possibly type with a default value.
 * @param defaultValue The default value to set for the possibly type
 */
export function possiblyFactory<T>(defaultValue: T | undefined = undefined): PossiblyFactory<T> {
  return {
    some: (value: T) => {
      if (value === undefined) {
        throw Error("Provided value must be defined");
      }
      return possibly<T>(value, defaultValue);
    },
    none: () => possibly<T>(undefined, defaultValue),
    fromValue: (value: T | undefined) => possibly<T>(value, defaultValue),
  };
}
