export type IntegerError = Partial<{
  integerError: (value: number) => string
  decimalError: (value: number) => string
}>

export const integerError = (value: number, isInteger: boolean | undefined, errorContext: IntegerError = {}) => {
  const { integerError, decimalError } = errorContext
  if(isInteger !== undefined) {
    if(isInteger === true && !Number.isInteger(value)) {
      throw new Error((integerError && integerError(value)) ?? "The number must be an integer")
    }
    if(isInteger === false && Number.isInteger(value)) {
      throw new Error((decimalError && decimalError(value)) ?? "The number must contain decimals")
    }
  }
}
