/**
 * Throw an error if a value isn't either a null or undefined
 * @param value The value to assert
 */
export function assertValue<T>(value: T, message: string = "Your value should be either null or undefined") {
  if (value !== undefined && value !== null) {
    throw new Error(message)
  }
}
