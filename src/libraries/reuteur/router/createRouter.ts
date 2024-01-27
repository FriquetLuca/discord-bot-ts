import { type Localization, type Route } from ".."
import { createRoute } from "./createRoute"
import { nestRouter } from "./nestRouter"
import { sortRouterSchemas } from "./sortRouterSchemas"

export const createRouter = <T extends string, U extends T, V = never>(routes: Route<V>[], localization: Localization<T, U> = {}, prefix: string = "") => {
  const mappedRoutes = new Map<string, Route<V>>()
  const sortedRoutes = sortRouterSchemas(routes.map((pseudoRoute) => {
    mappedRoutes.set(pseudoRoute.path, pseudoRoute)
    return createRoute(
      pseudoRoute.path,
      pseudoRoute.useLocal !== undefined
        ? { ...localization, useLocal: pseudoRoute.useLocal }
        : { ...localization, useLocal: localization.useLocal ?? false },
        prefix,
    )
  }))
  return nestRouter(sortedRoutes, mappedRoutes)
}
