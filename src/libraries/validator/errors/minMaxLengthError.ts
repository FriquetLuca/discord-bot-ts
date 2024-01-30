import { getTypeof } from "@/libraries/typeof"

export type MinMaxLengthError<V extends string|any[]> = Partial<{
  minMaxLengthError: (value: V, min: number, max: number) => string
  maxLengthError: (value: V, max: number) => string
  minLengthError: (value: V, min: number) => string
}>

export const minMaxLengthError = <V extends string|any[]>(val: V, min: number|undefined, max: number|undefined, errorContext: MinMaxLengthError<V> = {}) => {
  const { minMaxLengthError, maxLengthError, minLengthError } = errorContext
  if(min !== undefined) { 
    if(max !== undefined && (val.length < min || val.length > max)) {
      throw new Error((minMaxLengthError && minMaxLengthError(val, min, max)) ?? `The length of the ${getTypeof(val)} must be greater or equal to ${min} and less than ${max}`)
    }
    if(val.length < min) {
      throw new Error((minLengthError && minLengthError(val, min)) ?? `The length of the ${getTypeof(val)} must be greater or equal to ${min}`)
    }
  }
  if(max !== undefined && val.length > max) {
    throw new Error((maxLengthError && maxLengthError(val, max)) ?? `The length of the ${getTypeof(val)} must be less or equal to ${max}`)
  }
}
