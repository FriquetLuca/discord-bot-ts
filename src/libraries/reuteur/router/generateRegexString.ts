import { generateSlashRegex } from "../path"
import {type tokenizeRouterPath } from "./tokenizeRouterPath"

export const generateRegexString = (tokenizedRouter: ReturnType<typeof tokenizeRouterPath>, useLocal: boolean = false, keycodes: string[] = [], prefix: string = "") => {
  const regexBuilder = ["^"]
  for(let i = 0; i < tokenizedRouter.routerPath.length; i++) {
    const currentPath = tokenizedRouter.routerPath[i]
    const slash = generateSlashRegex(i, useLocal, keycodes, prefix)
    switch(currentPath.type) {
      case "PATH":
        regexBuilder.push(`${slash}${currentPath.name.replace(/[/\\^$*+?.()|[\]{}-]/g, '\\$&')}`)
        break
      case "WILD_CARD":
        regexBuilder.push(`${slash}(.*)`)
        break
      case "PARAMETER":
        const subpaths = currentPath.subpaths as {
          type: "PARAMETER" | "PARAMETERS" | "SUBPATH";
          name: string;
        }[]
        for(let j = 0; j < subpaths.length; j++) {
          const subpath = subpaths[j]
          const subSlash = j === 0 ? slash : ""
          switch(subpath.type) {
            case "SUBPATH":
              regexBuilder.push(`${subSlash}${subpath.name.replace(/[\-\\^$*+?.()|[\]{}]/g, '\\$&')}`)
              break
            case "PARAMETER":
              regexBuilder.push(`${subSlash}([^/]*)`)
              break
            case "PARAMETERS":
              regexBuilder.push(`${subSlash}(.*?[^/])`)
              break
          }
        }
        break
    }
  }
  regexBuilder.push("/?$")
  return regexBuilder.join("")
}
