import { type Perhaps, perhaps } from "./perhaps"
import { type Possibly, possibly } from "./possibly"

export type Maybe<T> = {
  readonly value: T | null
  readonly defaultValue: T | null
  isEmpty: () => boolean
  is: (compare: Maybe<T>) => boolean
  getOrDefault: () => T | null
  getOrElse: (defaultValue: T) => T
  overrideEmpty: (newValue: T) => Maybe<T>
  get: () => T | null
  map: <R>(f: (wrapped: T) => R) => Maybe<R>
  flatMap: <R>(f: (wrapped: T) => Maybe<R>) => Maybe<R>
  default: () => T | null
  perhaps: () => Perhaps<T>
  possibly: () => Possibly<T>
}

/**
 * Create a type that can have an optional value using null as not defined.
 */
export function maybe<T>(value: T | null = null, defaultValue: T | null = null): Maybe<T> {
  return {
    value,
    defaultValue,
    isEmpty: () => value === null,
    is: (compare) => value === compare.value,
    get: () => value,
    getOrElse: (defaultValue) => value === null ? defaultValue : value,
    getOrDefault: () => value === null ? defaultValue : value,
    map: <R>(f: (wrapped: T) => R) => value === null
      ? defaultValue === null
        ? maybe<R>(null)
        : maybe(f(defaultValue))
      : maybe(f(value)),
    flatMap: <R>(f: (wrapped: T) => Maybe<R>) => value === null
      ? defaultValue === null
        ? maybe<R>(null)
        : f(defaultValue)
      : f(value),
    default: () => defaultValue,
    perhaps: () => perhaps<T>(value, defaultValue),
    possibly: () => value !== null ? possibly<T>(value, defaultValue !== null ? defaultValue : undefined) : possibly<T>(undefined, defaultValue !== null ? defaultValue : undefined),
    overrideEmpty: (newValue: T) => value === null ? maybe(newValue) : maybe(value as T),
  }
}

export type MaybeFactory<T> = {
  some: (value: T) => Maybe<T>
  none: () => Maybe<T>
  fromValue: (value: T|null) => Maybe<T>
}

/**
 * Create a maybe factory to generate a maybe type with a default value.
 * @param defaultValue The default value to set for the maybe type
 */
export function maybeFactory<T>(defaultValue: T | null = null): MaybeFactory<T> {
  return {
    some: (value: T) => {
      if (value === null) {
        throw Error("Provided value must not be empty");
      }
      return maybe<T>(value, defaultValue);
    },
    none: () => maybe<T>(null, defaultValue),
    fromValue: (value: T | null) => maybe<T>(value, defaultValue),
  };
}
