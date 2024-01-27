import { assert } from "@/libraries/typeof"
import type { Collapse, OmitFirstArg, OverrideReturnType } from "@/libraries/types"
import { type DataSchema } from "../schema"

export type BooleanParserSchema = {
  checked?: boolean
  unchecked?: boolean
  undefinable: boolean
  optional: boolean
  nullable: boolean
}

export type BooleanSchemaToType<T extends BooleanParserSchema> = T["undefinable"] extends true
? (T["nullable"] extends true ? boolean | null | undefined : boolean | undefined)
: (T["nullable"] extends true ? boolean | null : boolean)

const booleanParser = <T extends BooleanParserSchema>(val: unknown, datas: T): BooleanSchemaToType<T> => {
  const {
    checked,
    unchecked,
    undefinable,
    nullable,
  } = datas
  if(undefinable === true && val === undefined) {
    return val as any
  }
  if(nullable === true && val === null) {
    return val as any
  }
  assert(val, "boolean")
  if(checked === true && val === true) { 
    throw new Error(`The boolean must be checked`)
  }
  if(unchecked === true && val === false) { 
    throw new Error(`The boolean must be unchecked`)
  }
  return val as any
}

export type BooleanValidatorChain<Prs extends <U>(value: unknown, arg: U) => any, T extends Record<string, (arg: U, ...args: any) => any>, U extends BooleanParserSchema> = {
  [K in keyof T]: OverrideReturnType<OmitFirstArg<T[K]>, BooleanValidatorChain<Prs, T, Collapse<U & ReturnType<OmitFirstArg<T[K]>>>>>
} & {
  schema: () => DataSchema<"boolean", (value: unknown) => ReturnType<typeof booleanParser<U>>, U>
  parse: (value: unknown) => ReturnType<typeof booleanParser<U>>
}

function baseBooleanValidator<Prs extends (value: unknown, arg: any) => any, T extends Record<string, (arg: U, ...args: any) => any>, U extends BooleanParserSchema>(fns: T, arg: U, parse: Prs) {
  const patchFns = {} as any
  for(const fnKey in fns) {
    const fn = fns[fnKey]
    patchFns[fnKey] = (...args: any) => baseBooleanValidator(fns, fn(arg, ...args), parse)
  }
  return {
    ...patchFns,
    schema: () => ({ "_type": "boolean", "_parser": (value: unknown) => parse(value, arg), "_datas": arg }),
    parse: (value: unknown) => parse(value, arg),
  } as BooleanValidatorChain<Prs, T, U>
}

export const booleanValidator = () => baseBooleanValidator({
    checked: (arg: {}, checked: boolean) => ({
      ...arg,
      checked,
    }),
    unchecked: (arg: {}, unchecked: boolean) => ({
      ...arg,
      unchecked,
    }),
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
    nullable: false as false,
  }, booleanParser)
