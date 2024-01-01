/**
 * Throw an error if a value is undefined
 * @param value The value to assert
 */
export function assertDefined<T>(value: T, message: string = "Your value is undefined") {
  if (value === undefined) {
    throw new Error(message)
  }
}
