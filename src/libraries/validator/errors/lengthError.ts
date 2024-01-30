import { getTypeof } from "@/libraries/typeof"

export type LengthError<T extends string|any[]> = Partial<{
  lengthError: (value: T, length: number) => string
}>

export const lengthError = <T extends string|any[]>(val: T, length: number | undefined, errorContext: LengthError<T> = {}) => {
  const { lengthError } = errorContext
  if(length !== undefined) {
    if(val.length !== length) {
      throw new Error((lengthError && lengthError(val, length)) ?? `The \`length\` of the ${getTypeof(val)} must be equal to ${length}`)
    }
  }
}
