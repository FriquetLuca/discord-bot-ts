export const stripBorderSlash = (content: string) => {
  const removePrefix = content[0] === "/" ? content.substring(1, content.length) : content
  return removePrefix[removePrefix.length - 1] === "/" ? removePrefix.substring(0, removePrefix.length - 1) : removePrefix
}
