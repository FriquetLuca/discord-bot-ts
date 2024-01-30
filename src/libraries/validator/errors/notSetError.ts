import type { ElementShape } from "../schema"

export type NotSetError = Partial<{
  notSetError: (key: string, object: object) => string
}>

export const notSetError = (currentItem: ElementShape, val: object, key: string, errorContext: NotSetError = {}) => {
  const { notSetError } = errorContext
  if(key in val) {
    return currentItem.parse((val as any)[key])
  } else {
    throw new Error((notSetError && notSetError(key, val)) ?? `The key \`${key}\` is not set`)
  }
}
