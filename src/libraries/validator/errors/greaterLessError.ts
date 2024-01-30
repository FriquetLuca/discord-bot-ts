import { getTypeof } from "@/libraries/typeof"

export type GreaterLessError<V extends bigint|number> = Partial<{
  greaterLessError: (value: V, greater: V, less: V) => string
  lessError: (value: V, less: V) => string
  greaterError: (value: V, greater: V) => string
}>

export const greaterLessError = <V extends bigint|number>(val: V, greater: V|undefined, less: V|undefined, errorContext: GreaterLessError<V> = {}) => {
  const { greaterLessError, lessError, greaterError } = errorContext
  if(less !== undefined) { 
    if(greater !== undefined && (val >= less || val <= greater)) {
      throw new Error((greaterLessError && greaterLessError(val, greater, less)) ?? `The ${getTypeof(val)} must be greater than ${greater} and less than ${less}`)
    }
    if(val >= less) {
      throw new Error((lessError && lessError(val, less)) ?? `The ${getTypeof(val)} must be less than ${less}`)
    }
  }
  if(greater !== undefined && val <= greater) {
    throw new Error((greaterError && greaterError(val, greater)) ?? `The ${getTypeof(val)} must be greater than ${greater}`)
  }
}
