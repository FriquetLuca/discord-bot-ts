import { getTypeof } from "@/libraries/typeof"

export type MinMaxError<V extends bigint|number> = Partial<{
  minMaxError: (value: V, min: V, max: V) => string
  maxError: (value: V, max: V) => string
  minError: (value: V, min: V) => string
}>

export const minMaxError = <V extends bigint|number>(val: V, min: V|undefined, max: V|undefined, errorContext: MinMaxError<V> = {}) => {
  const { minMaxError, maxError, minError } = errorContext
  if(min !== undefined) { 
    if(max !== undefined && (val < min || val > max)) {
      throw new Error((minMaxError && minMaxError(val, min, max)) ?? `The ${getTypeof(val)} must be greater or equal to ${min} and less than ${max}`)
    }
    if(val < min) {
      throw new Error((minError && minError(val, min)) ?? `The ${getTypeof(val)} must be greater or equal to ${min}`)
    }
  }
  if(max !== undefined && val > max) {
    throw new Error((maxError && maxError(val, max)) ?? `The ${getTypeof(val)} must be less or equal to ${max}`)
  }
}
