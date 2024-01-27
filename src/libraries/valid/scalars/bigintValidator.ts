import { assert } from "@/libraries/typeof"
import type { Collapse, OmitFirstArg, OverrideReturnType } from "@/libraries/types"
import { type DataSchema } from "../schema"

export type BigintParserSchema = {
  less?: bigint
  greater?: bigint
  min?: bigint
  max?: bigint
  undefinable: boolean
  optional: boolean
  nullable: boolean
}

export type BigintSchemaToType<T extends BigintParserSchema> = T["undefinable"] extends true
? (T["nullable"] extends true ? bigint | null | undefined : bigint | undefined)
: (T["nullable"] extends true ? bigint | null : bigint)

const bigintParser = <T extends BigintParserSchema>(val: unknown, datas: T): BigintSchemaToType<T> => {
  const {
    less,
    greater,
    min,
    max,
    undefinable,
    nullable,
  } = datas
  if(undefinable === true && val === undefined) {
    return val as any
  }
  if(nullable === true && val === null) {
    return val as any
  }
  assert(val, "bigint")
  if(min !== undefined) { 
    if(max !== undefined && (val < min || val > max)) {
      throw new Error(`The bigint must be greater or equal to ${min} and less than ${max}`)
    }
    if(val < min) {
      throw new Error(`The bigint must be greater or equal to ${min}`)
    }
  }
  if(max !== undefined && val > max) {
    throw new Error(`The bigint must be less or equal to ${max}`)
  }
  if(less !== undefined) { 
    if(greater !== undefined && (val >= less || val <= greater)) {
      throw new Error(`The bigint must be greater or equal to ${greater} and less than ${less}`)
    }
    if(val >= less) {
      throw new Error(`The bigint must be less than ${less}`)
    }
  }
  if(greater !== undefined && val <= greater) {
    throw new Error(`The bigint must be greater or equal to ${greater}`)
  }
  return val as any
}

export type BigintValidatorChain<Prs extends <U>(value: unknown, arg: U) => any, T extends Record<string, (arg: U, ...args: any) => any>, U extends BigintParserSchema> = {
  [K in keyof T]: OverrideReturnType<OmitFirstArg<T[K]>, BigintValidatorChain<Prs, T, Collapse<U & ReturnType<OmitFirstArg<T[K]>>>>>
} & {
  schema: () => DataSchema<"bigint", (value: unknown) => ReturnType<typeof bigintParser<U>>, U>
  parse: (value: unknown) => ReturnType<typeof bigintParser<U>>
}

function baseBigintValidator<Prs extends (value: unknown, arg: any) => any, T extends Record<string, (arg: U, ...args: any) => any>, U extends BigintParserSchema>(fns: T, arg: U, parse: Prs) {
  const patchFns = {} as any
  for(const fnKey in fns) {
    const fn = fns[fnKey]
    patchFns[fnKey] = (...args: any) => baseBigintValidator(fns, fn(arg, ...args), parse)
  }
  return {
    ...patchFns,
    schema: () => ({ "_type": "bigint", "_parser": (value: unknown) => parse(value, arg), "_datas": arg }),
    parse: (value: unknown) => parse(value, arg),
  } as BigintValidatorChain<Prs, T, U>
}

export const bigintValidator = () => baseBigintValidator({
    min: (arg: {}, minValue: bigint) => ({
      ...arg,
      min: minValue,
    }),
    max: (arg: {}, maxValue: bigint) => ({
      ...arg,
      max: maxValue,
    }),
    less: (arg: {}, less: bigint) => ({
      ...arg,
      less,
    }),
    greater: (arg: {}, greater: bigint) => ({
      ...arg,
      greater,
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
  }, bigintParser)
