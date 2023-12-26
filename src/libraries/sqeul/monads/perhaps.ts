import { type Maybe, maybe } from "./maybe"
import { type Possibly, possibly } from "./possibly"

export type Perhaps<T> = {
  readonly value: T | undefined | null
  readonly defaultValue: T | undefined | null
  isEmpty: () => boolean
  is: (compare: Perhaps<T>) => boolean
  getOrDefault: () => T | undefined | null
  getOrElse: (defaultValue: T) => T
  get: () => T | undefined | null
  map: <R>(f: (wrapped: T) => R) => Perhaps<R>
  flatMap: <R>(f: (wrapped: T) => Perhaps<R>) => Perhaps<R>
  default: () => T | undefined | null
  possibly: () => Possibly<T>
  maybe: () => Maybe<T>
  overrideEmpty: (newValue: T) => Perhaps<T>
}

/**
 * Create a type that can have an optional value.
 */
export function perhaps<T>(value: T | undefined | null = undefined, defaultValue: T | undefined | null = undefined): Perhaps<T> {
  return {
    value,
    defaultValue,
    isEmpty: () => value === null || value === undefined,
    is: (compare) => value === compare.value,
    get: () => value,
    getOrElse: (defaultValue) => value === undefined || value === null ? defaultValue : value,
    getOrDefault: () => (value === undefined || value === null) ? defaultValue : value,
    overrideEmpty: (newValue: T) => value === null ? perhaps(newValue) : perhaps(value as T),
    map: <R>(f: (wrapped: T) => R) => (value === undefined || value === null)
      ? (defaultValue === undefined || defaultValue === null)
        ? perhaps<R>(defaultValue as (undefined | null))
        : perhaps(f(defaultValue))
      : perhaps(f(value as T)),
    flatMap: <R>(f: (wrapped: T) => Perhaps<R>) => (value === undefined || value === null)
      ? (defaultValue === undefined || defaultValue === null)
        ? perhaps<R>(defaultValue as (undefined | null))
        : f(defaultValue as T)
      : f(value as T),
    default: () => defaultValue,
    possibly: () => value !== null ? possibly<T>(value, defaultValue !== null ? defaultValue : undefined) : possibly<T>(undefined, defaultValue !== null ? defaultValue : undefined),
    maybe: () => value !== undefined ? maybe<T>(value, defaultValue !== undefined ? defaultValue : null) : maybe<T>(null, defaultValue !== undefined ? defaultValue : null)
  }
}

export type PerhapsFactory<T> = {
  some: (value: T) => Perhaps<T>
  none: () => Perhaps<T>
  fromValue: (value: T|undefined) => Perhaps<T>
}

/**
 * Create a perhaps factory to generate a perhaps type with a default value.
 * @param defaultValue The default value to set for the perhaps type
 */
export function perhapsFactory<T>(defaultValue: T | undefined | null = undefined): PerhapsFactory<T> {
  return {
    some: (value: T) => {
      if (value === undefined || value === null) {
        throw Error("Provided value must exist");
      }
      return perhaps<T>(value, defaultValue);
    },
    none: () => perhaps<T>(undefined, defaultValue),
    fromValue: (value: T | undefined | null) => perhaps<T>(value, defaultValue),
  };
}
