export const generateSlashRegex = (i: number, useLocal: boolean, keycodes: string[], prefix: string = "") => {
  if(i === 0) {
    if(prefix.length > 0) {
      const fixedPrefix = prefix.split("/").map((p) => p.replace(/[\-\\^$*+?.()|[\]{}]/g, '\\$&')).join("/")
      if(useLocal === true && keycodes.length > 0) {
        return `(?:/?${fixedPrefix}/|(?:/?${fixedPrefix}/(${keycodes.reduce((prev, current) => `${prev}|${current}`)})/))`
      }
      return `/?${fixedPrefix}/`
    } else {
      if(useLocal === true && keycodes.length > 0) {
        return `(?:/?|(?:/?(${keycodes.reduce((prev, current) => `${prev}|${current}`)})/)?)`
      }
      return "/?"
    }
  }
  return "/"
}
