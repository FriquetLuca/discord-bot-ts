export * from "./arrayValidator"
export * from "./objectValidatorus"

export type Parser = {
  parse: (arg: unknown) => any
  schema: () => any
}
