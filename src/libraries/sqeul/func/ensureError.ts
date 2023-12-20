/**
 * A helper function to make sure an error is given back from the value
 * @param value Unknown value
 * @param defaultMessage A default message for the error if the value doesn't exist
 * @returns An error for sure 👍
 */
export function ensureError<T extends Error>(value: unknown, defaultMessage?: string): T {
  if (value instanceof Error) {
    return value as T
  }
  let stringified = "Unknown Error"
  try {
    stringified = `Unknown Error: ${JSON.stringify(value)}`
  } catch { }
  return new Error(defaultMessage || stringified) as T
}
