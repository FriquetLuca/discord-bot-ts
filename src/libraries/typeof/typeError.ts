export function typeError(val: unknown, typeName: string) {
  return new Error(`${val} is not of type ${typeName}`)
}
