/**
 * Throw an error if a value is not false
 * @param value The value to assert
 */
export function assertFalse(value: boolean, message: string = "Your value is not false") {
  if (value !== false) {
    throw new Error(message)
  }
}
