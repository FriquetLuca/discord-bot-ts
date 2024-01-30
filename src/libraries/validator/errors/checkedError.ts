export type CheckedError = Partial<{
  checkedError: () => string
  uncheckedError: () => string
}>

export const checkedError = (val: boolean, checked: boolean | undefined, errorContext: CheckedError = {}) => {
  const { checkedError, uncheckedError } = errorContext
  if(checked === true && val !== true) { 
    throw new Error((checkedError && checkedError()) ?? `The boolean must be checked`)
  }
  if(checked === false && val !== false) { 
    throw new Error((uncheckedError && uncheckedError()) ?? `The boolean must be unchecked`)
  }
}
