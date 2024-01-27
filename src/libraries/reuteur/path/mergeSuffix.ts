import { stripBorderSlash } from "./stripBorderSlash"

export const mergeSuffix = (suffix: string, content: string) => {
  const fixedSuffix = stripBorderSlash(suffix)
  const fixedContentPrefix = stripBorderSlash(content)
  return `${fixedContentPrefix}/${fixedSuffix}`
}
