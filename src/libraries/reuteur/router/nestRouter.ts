import { type Route, type Router } from ".."
import { sortRouterSchemas } from "./sortRouterSchemas"

export const nestRouter = <V = never>(routes: ReturnType<typeof sortRouterSchemas>, mappedRoutes: Map<string, Route<V>>): Router<V> => {
  return {
    getMap: () => mappedRoutes,
    getRoutes: () => routes,
    mergeRouter: <V2 = void>(router: Router<V2>) => nestRouter<V | V2>(sortRouterSchemas([ ...routes, ...router.getRoutes() ]), new Map<string, Route<V>|Route<V2>>([ ...mappedRoutes, ...router.getMap() ])),
    findRoute: (originPath: string) => mappedRoutes.get(originPath),
    matchURL: async (url: string) => {
      for(const route of routes) {
        const match = route.matchURL(url)
        if(match !== null) {
          const result = mappedRoutes.get(match.origin)
          if(result !== undefined) {
            return await result.execute({
              location: match.requestedPath.split("?")[0],
              local: match.local,
              params: match.params,
              queryParams: match.query,
            })
          }
          return
        }
      }
    },
    matchURLSync: (url: string) => {
      for(const route of routes) {
        const match = route.matchURL(url)
        if(match !== null) {
          const result = mappedRoutes.get(match.origin)
          if(result !== undefined) {
            return result.execute({
              location: match.requestedPath.split("?")[0],
              local: match.local,
              params: match.params,
              queryParams: match.query,
            })
          }
          return
        }
      }
    }
  }
}
