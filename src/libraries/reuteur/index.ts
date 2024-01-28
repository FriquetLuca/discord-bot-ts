import { mergePrefix, mergeSuffix, stripBorderSlash } from "./path"
import { createRouter, type sortRouterSchemas } from "./router"

export type Localization<T extends string, U extends T> = {
  useLocal?: boolean
  defaultLocal?: U
  locals?: T[]
}

export type RouteApplication<Result = never> = ({ location, local, params, queryParams }: {
  location: string;
  local: string | null;
  params: Record<string, string[] | string>;
  queryParams: Record<string, string> | null;
}) => Result

export type Route<V = never> = {
  path: string,
  execute: RouteApplication<V>
  useLocal?: boolean,
}

export type Router<V = never> = {
  getMap: () => Map<string, Route<V>>
  getRoutes: () => ReturnType<typeof sortRouterSchemas>
  mergeRouter: <V2 = void>(router: Router<V2>) => Router<V | V2>
  findRoute: (originPath: string) => Route<V> | undefined
  matchURL: (url: string) => Promise<V | undefined>
  matchURLSync: (url: string) => V | undefined
}

export type RouterBuilder<Ret = never> = {
  getRoutes: () => Route<Ret>[]
  addPrefix: (prefix: string) => RouterBuilder<Ret>
  addSuffix: (suffix: string) => RouterBuilder<Ret>
  getRootPrefix: () => string
  setRootPrefix: (prefix: string) => RouterBuilder<Ret>
  leftMerge: <Ret2 = void>(router: RouterBuilder<Ret2>) => RouterBuilder<Ret2 | Ret>
  rightMerge: <Ret2 = void>(router: RouterBuilder<Ret2>) => RouterBuilder<Ret | Ret2>
  insert: <NewRouteRet = void>(...newRoutes: Route<NewRouteRet>[]) => RouterBuilder<Ret | NewRouteRet>
  build: <T extends string, U extends T>(localization?: Localization<T, U>) => ReturnType<typeof createRouter<T, U, Ret>>
}

export const routerBuilder = <Ret = never>(routes: Route<Ret>[] = [], rootPrefix: string = ""): RouterBuilder<Ret> => {
  return {
    getRootPrefix: () => rootPrefix,
    getRoutes: () => routes,
    addPrefix: (prefix: string) => {
      if(prefix.length > 0) {
        return routerBuilder(routes.map((route) => ({
          ...route,
          path: mergePrefix(prefix, route.path)
        })), rootPrefix)
      }
      return routerBuilder(routes, rootPrefix)
    },
    addSuffix: (suffix: string) => {
      if(suffix.length > 0) {
        return routerBuilder(routes.map((route) => ({
          ...route,
          path: mergeSuffix(suffix, route.path)
        })), rootPrefix)
      }
      return routerBuilder(routes, rootPrefix)
    },
    setRootPrefix: (prefix: string) => routerBuilder(routes, stripBorderSlash(prefix)),
    leftMerge: <Ret2 = void>(router: RouterBuilder<Ret2>) => routerBuilder<Ret2 | Ret>([ ...routes,  ...router.getRoutes() ], mergePrefix(router.getRootPrefix(), rootPrefix)),
    rightMerge: <Ret2 = void>(router: RouterBuilder<Ret2>) => routerBuilder<Ret | Ret2>([ ...routes , ...router.getRoutes() ], mergeSuffix(router.getRootPrefix(), rootPrefix)),
    insert: <NewRouteRet = void>(...newRoutes: Route<NewRouteRet>[]) => routerBuilder<Ret | NewRouteRet>([ ...routes , ...newRoutes ], rootPrefix),
    build: <T extends string, U extends T>(localization: Localization<T, U> = {}) => createRouter(routes, localization, rootPrefix),
  }
}

/*
Example:


const router = routerBuilder()
  .setRootPrefix("api/assets")
  .insert({
    path: "/utilisateur/[qualificatif]",
    useLocal: true,
    execute: (ctx) => {
      return ctx
    }
  })
  .build({
    useLocal: false,
    locals: ["en", "fr"],
    defaultLocal: "en",
  })
const url = "api/assets/fr/utilisateur/pas beau/?name=oka"
console.log(router.matchURLSync(url))
*/