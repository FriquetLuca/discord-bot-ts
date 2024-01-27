export * from "./arrayValidator"
export * from "./objectValidator"

export type Parser = {
  parse: (arg: unknown) => any
  schema: () => any
}
