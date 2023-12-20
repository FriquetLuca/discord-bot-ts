/**
 * Throw an error if a value is either null or undefined
 * @param value The value to assert
 */
export function assertExist<T>(value: T, message: string = "Your value is either null or undefined") {
  if (value === undefined || value === null) {
    throw new Error(message)
  }
}
