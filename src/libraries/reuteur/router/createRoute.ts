import { type Localization } from ".."
import { extractParameters } from "./extractParameters"
import { generateRegexString } from "./generateRegexString"
import { tokenizeRouterPath } from "./tokenizeRouterPath"

export const createRoute = <T extends string, U extends T>(currentPath: string, localization: Localization<T, U> = {}, prefix: string) => {
  const tokenizedRouter = tokenizeRouterPath(currentPath)
  const generatedRegex = generateRegexString(tokenizedRouter, localization.useLocal ?? false, localization.locals ?? [], prefix)
  const allParams = extractParameters(tokenizedRouter.routerPath)

  const getNextPath = () => `/${tokenizedRouter.routerPath.map((p) => p.toNextPath()).join("/")}`
  const getFastifyPath = () => `/${tokenizedRouter.routerPath.map((p) => p.toFastifyPath()).join("/")}`

  return {
    getRegex: () => generatedRegex,
    getPath: () => tokenizedRouter.path,
    getSchema: () => tokenizedRouter.routerPath,
    getNextPath,
    getFastifyPath,
    matchURL: (requestedPath: string) => {
      const splitPath = requestedPath.split("?")
      if(splitPath.length > 2 || splitPath.length === 0) {
        throw new Error("Something went wrong when parsing the query parameters")
      }
      const result = new RegExp(generatedRegex).exec(splitPath[0])
      if(result === null) {
        return null
      }
      const maybeTreat = result.slice(1) as string[]|null
      const local = maybeTreat !== null ? maybeTreat[0] : null
      const maybeParams = maybeTreat !== null ? maybeTreat.slice(1).map((v, i) => ({
        name: allParams[i].name,
        value: allParams[i].type === "PARAMETERS" ? v.split("/") : v,
      })) : null

      const paramsBody: Record<string, string | string[]> = {}
      if(maybeParams !== null) {
        maybeParams.forEach((param) => {
          paramsBody[param.name] = param.value
        })
      }

      const queryBody: Record<string, string> = {}
      if(splitPath.length === 2) {
        splitPath[1].split("&").forEach((keyval) => {
          const [key, value] = keyval.split("=")
          queryBody[key] = value
        })
      }
      return {
        origin: tokenizedRouter.path,
        requestedPath,
        local: local ?? localization.defaultLocal ?? null,
        query: splitPath.length === 2 ? queryBody : null,
        params: paramsBody
      }
    }
  }
}
