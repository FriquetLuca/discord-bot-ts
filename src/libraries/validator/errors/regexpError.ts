export const regexpTest = (regex: RegExp | undefined, value: string, errorContext: Partial<{
  regexError: (value: string) => string
}> = {}) => {
  const { regexError } = errorContext
  if(regex) {
    const result = regex.exec(value)
    if(result === null) {
      throw new Error((regexError && regexError(value)) ?? `The \`regex\` didn't match the value \`${value}\``)
    }
  }
}
