type Maybe<T> = {
  get: () => T | null
  getOrElse: (defaultValue: T) => T
  isEmpty: () => boolean
  is: (compare: Maybe<T>) => boolean
  bind: <R>(f: (wrapped: T) => R) => Maybe<R>
  flatMap: <R>(f: (wrapped: T) => Maybe<R>) => Maybe<R>
  overrideEmpty: (newValue: T) => Maybe<T>
}
export function fromValue<T>(value: T): Maybe<T> {
  return {
    get: () => value,
    getOrElse: (defaultValue: T) => value == null ? value : defaultValue,
    isEmpty: () => value === null,
    is: (compare: Maybe<T>) => compare.get() === value,
    bind: <R>(f: (wrapped: T) => R) => value === null ? fromValue<R>(null as R) : fromValue(f(value)),
    flatMap: <R>(f: (wrapped: T) => Maybe<R>) => value === null ? fromValue<R>(null as R) : f(value),
    overrideEmpty: (newValue: T) => value === null ? fromValue(newValue) : fromValue(value as T),
  }
}
