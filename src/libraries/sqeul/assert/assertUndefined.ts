/**
 * Throw an error if a value isn't undefined
 * @param value The value to assert
 */
export function assertUndefined<T>(value: T, message: string = "Your value isn't undefined") {
  if (value !== undefined) {
    throw new Error(message)
  }
}
