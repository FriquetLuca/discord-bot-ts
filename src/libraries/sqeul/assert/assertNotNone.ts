/**
 * Throw an error if a value is null
 * @param value The value to assert
 */
export function assertNotNone<T>(value: T, message: string = "Your value is null") {
  if (value === null) {
    throw new Error(message)
  }
}
