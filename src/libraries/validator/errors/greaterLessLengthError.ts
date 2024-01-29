import { getTypeof } from "@/libraries/typeof"

export const greaterLessLengthError = <V extends string|any[]>(val: V, greater: number|undefined, less: number|undefined, errorContext: Partial<{
  greaterLessLengthError: (value: V, greater: number, less: number) => string
  greaterLengthError: (value: V, greater: number) => string
  lessLengthError: (value: V, less: number) => string
}> = {}) => {
  const { greaterLessLengthError, greaterLengthError, lessLengthError } = errorContext
  if(less !== undefined) { 
    if(greater !== undefined && (val.length >= less || val.length <= greater)) {
      throw new Error((greaterLessLengthError && greaterLessLengthError(val, greater, less)) ?? `The length of the ${getTypeof(val)} must be greater or equal to ${greater} and less than ${less}`)
    }
    if(val.length >= less) {
      throw new Error((lessLengthError && lessLengthError(val, less)) ?? `The length of the ${getTypeof(val)} must be less than ${less}`)
    }
  }
  if(greater !== undefined && val.length <= greater) {
    throw new Error((greaterLengthError && greaterLengthError(val, greater)) ?? `The length of the ${getTypeof(val)} must be greater or equal to ${greater}`)
  }
}
