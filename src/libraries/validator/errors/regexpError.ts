export type RegexpError = Partial<{
  regexError: (value: string) => string
}>

export const regexpError = (regex: RegExp | undefined, value: string, errorContext: RegexpError = {}) => {
  const { regexError } = errorContext
  if(regex) {
    const result = regex.exec(value)
    if(result === null) {
      throw new Error((regexError && regexError(value)) ?? `The \`regex\` didn't match the value \`${value}\``)
    }
  }
}
