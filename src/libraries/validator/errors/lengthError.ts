import { getTypeof } from "@/libraries/typeof"

export const lengthError = <T extends string|any[]>(val: T, length: number | undefined, errorContext: Partial<{
  lengthError: (value: T, length: number) => string
}> = {}) => {
  const { lengthError } = errorContext
  if(length !== undefined) {
    if(val.length !== length) {
      throw new Error((lengthError && lengthError(val, length)) ?? `The \`length\` of the ${getTypeof(val)} must be equal to ${length}`)
    }
  }
}
