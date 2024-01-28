import { type createRoute } from "./createRoute"

export const sortRouterSchemas = (schemas: ReturnType<typeof createRoute>[]) => schemas.sort((lhs, rhs) => {
  const lhs_schema = lhs.getSchema()
  const rhs_schema = rhs.getSchema()
  let i = 0
  let max_search = Math.max(lhs_schema.length, rhs_schema.length)
  while(i < max_search) {
    // We can compare both here
    if(i < lhs_schema.length && i < rhs_schema.length) {
      const lhs_element = lhs_schema[i]
      const rhs_element = rhs_schema[i]
      if(lhs_element.type === "WILD_CARD" && rhs_element.type !== "WILD_CARD") {
        return 1
      }
      if(lhs_element.type !== "WILD_CARD" && rhs_element.type === "WILD_CARD") {
        return -1
      }
      if(lhs_element.type === "PARAMETER" && rhs_element.type === "PATH") {
        return 1
      }
      if(lhs_element.type === "PATH" && rhs_element.type === "PARAMETER") {
        return -1
      }
      if(lhs_element.type === "PATH" && rhs_element.type === "PATH") {
        const compare = lhs_element.name.localeCompare(rhs_element.name)
        if(compare !== 0) {
          return compare
        }
      }
      if(lhs_element.type === "PARAMETER" && rhs_element.type === "PARAMETER") {
        const lhs_params = lhs_element.subpaths
        const rhs_params = rhs_element.subpaths
        let j = 0
        let max_subsearch = Math.max(lhs_params.length, rhs_params.length)
        while(j < max_subsearch) {
          if(j < lhs_params.length && j < rhs_params.length) {
            const lhs_params_element = lhs_params[j]
            const rhs_params_element = rhs_params[j]
            if(lhs_params_element.type === "SUBPATH" && rhs_params_element.type === "SUBPATH") {
              const compare = lhs_params_element.name.localeCompare(rhs_params_element.name)
              if(compare !== 0) {
                return compare
              }
            }
            if(lhs_params_element.type === "PARAMETER" && rhs_params_element.type === "PARAMETER") {
              if(j + 1 < lhs_params.length && j + 1 === rhs_params.length) {
                return -1
              } else if(j + 1 === lhs_params.length && j + 1 < rhs_params.length) {
                return 1
              }
            }
            if(lhs_params_element.type === "PARAMETER" && rhs_params_element.type === "PARAMETERS") {
              return -1
            }
            if(lhs_params_element.type === "PARAMETERS" && rhs_params_element.type === "PARAMETER") {
              return 1
            }
          } else if(lhs_params.length > rhs_params.length) { // There's more elements on the left, let's put it first
            return -1
          } else if(lhs_params.length < rhs_params.length) { // There's more elements on the right, let's put it first
            return 1
          }
          j++
        }
      }
    } else if(lhs_schema.length > rhs_schema.length) { // There's more elements on the left, let's put it first
      return -1
    } else if(lhs_schema.length < rhs_schema.length) { // There's more elements on the right, let's put it first
      return 1
    }
    i++
  }
  return 0
})
