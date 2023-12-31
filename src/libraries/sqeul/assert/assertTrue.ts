/**
 * Throw an error if a value is false
 * @param value The value to assert
 */
export function assertTrue(value: boolean, message: string = "Your value is not true") {
  if (value !== true) {
    throw new Error(message)
  }
}
