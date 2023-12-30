/**
 * Throw an error if a valueA is not equal to a valueB
 * @param valueA The first value to assert
 * @param valueB The second value to assert
 */
export function assertEqual(valueA: any, valueB: any, message: string = "Your values should be equals") {
  if (valueA !== valueB) {
    throw new Error(message)
  }
}
