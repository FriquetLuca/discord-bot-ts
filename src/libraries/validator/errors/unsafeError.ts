export type UnsafeError = Partial<{
  unsafeError: (unsafeKeys: string[], value: object) => string
}>

export const unsafeError = (unsafe: boolean | undefined, unsafeKeys: string[], value: object, errorContext: UnsafeError = {}) => {
  const { unsafeError } = errorContext
  if(unsafe !== true && unsafeKeys.length > 0) {
    throw new Error((unsafeError && unsafeError(unsafeKeys, value)) ?? `The following keys: ${unsafeKeys.map((value, i, arr) => i === arr.length - 1 ? `and \`${value}\`` : `\`${value}\`, `)} has been found but are not part of the schema`)
  }
}
