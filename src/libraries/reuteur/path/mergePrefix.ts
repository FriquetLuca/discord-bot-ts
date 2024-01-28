import { stripBorderSlash } from "./stripBorderSlash"

export const mergePrefix = (prefix: string, content: string) => {
  const fixedPrefix = stripBorderSlash(prefix)
  const fixedContentPrefix = stripBorderSlash(content)
  return `${fixedPrefix}/${fixedContentPrefix}`
}
