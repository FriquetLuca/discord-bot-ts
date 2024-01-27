import { assert } from "@/libraries/typeof"
import type { Collapse, OmitFirstArg, OverrideReturnType } from "@/libraries/types"
import { type DataSchema } from "../schema"

export type ErrorParserSchema = {
  undefinable: boolean
  nullable: boolean
  optional: boolean
}

const errorParser = <T extends ErrorParserSchema>(val: unknown, datas: T): T["undefinable"] extends true
  ? (T["nullable"] extends true ? Date | null | undefined : Date | undefined)
  : (T["nullable"] extends true ? Date | null : Date
  ) => {
  const {
    undefinable,
    nullable,
  } = datas
  if(undefinable === true && val === undefined) {
    return val as any
  }
  if(nullable === true && val === null) {
    return val as any
  }
  assert(val, "error")
  return val as any
}

export type ErrorValidatorChain<Prs extends <U>(value: unknown, arg: U) => any, T extends Record<string, (arg: U, ...args: any) => any>, U extends ErrorParserSchema> = {
  [K in keyof T]: OverrideReturnType<OmitFirstArg<T[K]>, ErrorValidatorChain<Prs, T, Collapse<U & ReturnType<OmitFirstArg<T[K]>>>>>
} & {
  schema: () => DataSchema<"error", (value: unknown) => ReturnType<typeof errorParser<U>>, U>
  parse: (value: unknown) => ReturnType<typeof errorParser<U>>
}

function baseErrorValidator<Prs extends (value: unknown, arg: any) => any, T extends Record<string, (arg: U, ...args: any) => any>, U extends ErrorParserSchema>(fns: T, arg: U, parse: Prs) {
  const patchFns = {} as any
  for(const fnKey in fns) {
    const fn = fns[fnKey]
    patchFns[fnKey] = (...args: any) => baseErrorValidator(fns, fn(arg, ...args), parse)
  }
  return {
    ...patchFns,
    schema: () => ({ "_type": "error", "_parser": (value: unknown) => parse(value, arg), "_datas": arg }),
    parse: (value: unknown) => parse(value, arg),
  } as ErrorValidatorChain<Prs, T, U>
}

export const errorValidator = () => baseErrorValidator({
    optional: (arg: {}) => ({
      ...arg,
      optional: true as true,
    }),
    defined: (arg: {}) => ({
      ...arg,
      optional: false as false,
    }),
    definable: (arg: {}) => ({
      ...arg,
      undefinable: false as false,
    }),
    undefinable: (arg: {}) => ({
      ...arg,
      undefinable: true as true,
    }),
    required: (arg: {}) => ({
      ...arg,
      optional: false as false,
      undefinable: false as false,
    }),
    nullable: (arg: {}) => ({
      ...arg,
      nullable: true as true,
    }),
    notnull: (arg: {}) => ({
      ...arg,
      nullable: false as false,
    }),
  }, {
    optional: false as false,
    undefinable: false as false,
    nullable: false as false
  }, errorParser)
