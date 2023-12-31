/**
 * Throw an error if a valueA is equal to a valueB
 * @param valueA The first value to assert
 * @param valueB The second value to assert
 */
export function assertNEqual(valueA: any, valueB: any, message: string = "Your values should be differents") {
  if (valueA === valueB) {
    throw new Error(message)
  }
}
