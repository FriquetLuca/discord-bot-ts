/**
 * Throw an error if a value is not null
 * @param value The value to assert
 */
export function assertNone<T>(value: T, message: string = "Your value isn't null") {
  if (value !== null) {
    throw new Error(message)
  }
}
