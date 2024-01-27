import { type tokenizeRouterPath } from "./tokenizeRouterPath"

export const extractParameters = (routerPath: ReturnType<typeof tokenizeRouterPath>["routerPath"]) => routerPath
  .filter((v) => v.type === "PARAMETER" || v.type === "WILD_CARD")
  .flatMap((v) => {
    if(v.type === "PARAMETER") {
      return v.subpaths.filter(p => p.type !== "SUBPATH").map((v) => ({
        type: v.type,
        name: v.name,
      })) as any
    }
    return [{
      type: v.type,
      name: v.name
    }] as any
  }) as ({
    type: "PARAMETERS" | "PARAMETER" | "WILD_CARD"
    name: string
  })[]