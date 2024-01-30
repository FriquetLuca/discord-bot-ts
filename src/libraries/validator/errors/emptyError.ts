import { getTypeof } from "@/libraries/typeof"

export type EmptyError<V extends string|any[]> = Partial<{
  emptyError: (value: V) => string
  notEmptyError: (value: V) => string
}>

export const emptyError = <V extends string|any[]>(val: V, empty: boolean | undefined, errorContext: EmptyError<V> = {}) => {
  const { emptyError, notEmptyError } = errorContext
  if(empty === true && val.length !== 0) {
    throw new Error((emptyError && emptyError(val)) ?? `The ${getTypeof(val)} must be empty`)
  }
  if(empty === false && val.length === 0) {
    throw new Error((notEmptyError && notEmptyError(val)) ?? `The ${getTypeof(val)} must contain at least one element`)
  }
}
