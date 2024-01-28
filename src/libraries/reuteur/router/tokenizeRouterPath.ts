import { subdividePath } from "../path"

export const tokenizeRouterPath = (currentPath: string) => {
  const path = currentPath
  const routerPath = subdividePath(currentPath)
    .map(v => {
      if(v === "*") {
        return {
          type: "WILD_CARD" as "WILD_CARD",
          name: "*",
          toNextPath: () => v as string,
          toFastifyPath: () => v as string,
        }
      }
      let parameterStartIndex = v.indexOf("[")
      if(parameterStartIndex >= 0) {
        const subParams: ({
          type: "PARAMETER" | "SUBPATH"
          name: string
        })[] = []
        if(parameterStartIndex > 0) {
          subParams.push({
            type: "SUBPATH" as "SUBPATH",
            name: v.substring(0, parameterStartIndex)
          })
        }
        while(parameterStartIndex >= 0) {
          let parameterEndIndex = v.indexOf("]", parameterStartIndex + 1)
          if(parameterEndIndex < 0) {
            throw new Error("The closing bracket for the parameter is missing")
          }
          subParams.push({
            type: "PARAMETER" as "PARAMETER",
            name: v.substring(parameterStartIndex + 1, parameterEndIndex)
          })
          parameterStartIndex = v.indexOf("[", parameterEndIndex + 1)
          if(parameterStartIndex > 0) {
            subParams.push({
              type: "SUBPATH" as "SUBPATH",
              name: v.substring(parameterEndIndex + 1, parameterStartIndex)
            })
          }
        }
        return {
          type: "PARAMETER" as "PARAMETER",
          name: v,
          subpaths: subParams.map(v => {
            if(v.type === "PARAMETER" && v.name.length > 3 && v.name[0] === "." && v.name[1] === "." && v.name[2] === ".") {
              return {
                type: "PARAMETERS" as "PARAMETERS",
                name: v.name.substring(3, v.name.length)
              }
            }
            return { ...v }
          }),
          toNextPath: () => subParams.map((p) => {
            if(p.type === "PARAMETER") {
              return `[${p.name}]`
            }
            return p.name
          }).join(""),
          toFastifyPath: () => subParams.map((p) => {
            if(p.type === "PARAMETER") {
              return `:${p.name.substring(0, 3) === "..." ? `${p.name.substring(3, p.name.length).replace(":", "::")}(^.*?[^/])` : p.name.replace(":", "::")}`
            }
            return p.name
          }).join(""),
        }
      }
      return {
        type: "PATH" as "PATH",
        name: v,
        toNextPath: () => v,
        toFastifyPath: () => v.replace(":", "::"),
      }
    })
  
  return {
    path,
    routerPath,
  }
}
