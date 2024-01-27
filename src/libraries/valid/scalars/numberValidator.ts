import { assert } from "@/libraries/typeof"
import type { Collapse, OmitFirstArg, OverrideReturnType } from "@/libraries/types"
import { type DataSchema } from "../schema"

export type NumberParserSchema = {
  min?: number
  max?: number
  less?: number
  greater?: number
  integer?: boolean
  undefinable: boolean
  optional: boolean
  nullable: boolean
}

const numberParser = <T extends NumberParserSchema>(val: unknown, datas: T): T["undefinable"] extends true
? (T["nullable"] extends true ? number | null | undefined : number | undefined)
: (T["nullable"] extends true ? number | null : number
) => {
  const {
    integer,
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
  assert(val, "number")
  if(min !== undefined) { 
    if(max !== undefined && (val < min || val > max)) {
      throw new Error(`The number must be greater or equal to ${min} and less than ${max}`)
    }
    if(val < min) {
      throw new Error(`The number must be greater or equal to ${min}`)
    }
  }
  if(max !== undefined && val > max) {
    throw new Error(`The number must be less or equal to ${max}`)
  }
  if(less !== undefined) { 
    if(greater !== undefined && (val >= less || val <= greater)) {
      throw new Error(`The number must be greater or equal to ${greater} and less than ${less}`)
    }
    if(val >= less) {
      throw new Error(`The number must be less than ${less}`)
    }
  }
  if(greater !== undefined && val <= greater) {
    throw new Error(`The number must be greater or equal to ${greater}`)
  }
  if(integer === true && !Number.isInteger(val)) {
    throw new Error(`The number must be an integer`)
  }
  return val as any
}

export type NumberValidatorChain<Prs extends <U>(value: unknown, arg: U) => any, T extends Record<string, (arg: U, ...args: any) => any>, U extends NumberParserSchema> = {
  [K in keyof T]: OverrideReturnType<OmitFirstArg<T[K]>, NumberValidatorChain<Prs, T, Collapse<U & ReturnType<OmitFirstArg<T[K]>>>>>
} & {
  schema: () => DataSchema<"number", (value: unknown) => ReturnType<typeof numberParser<U>>, U>
  parse: (value: unknown) => ReturnType<typeof numberParser<U>>
}

function baseNumberValidator<Prs extends (value: unknown, arg: any) => any, T extends Record<string, (arg: U, ...args: any) => any>, U extends NumberParserSchema>(fns: T, arg: U, parse: Prs) {
  const patchFns = {} as any
  for(const fnKey in fns) {
    const fn = fns[fnKey]
    patchFns[fnKey] = (...args: any) => baseNumberValidator(fns, fn(arg, ...args), parse)
  }
  return {
    ...patchFns,
    schema: () => ({ "_type": "number", "_parser": (value: unknown) => parse(value, arg), "_datas": arg }),
    parse: (value: unknown) => parse(value, arg),
  } as NumberValidatorChain<Prs, T, U>
}

export const numberValidator = () => baseNumberValidator({
    min: (arg: {}, minValue: number) => ({
      ...arg,
      min: minValue,
    }),
    max: (arg: {}, maxValue: number) => ({
      ...arg,
      max: maxValue,
    }),
    less: (arg: {}, less: number) => ({
      ...arg,
      less,
    }),
    greater: (arg: {}, greater: number) => ({
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
    isInteger: (arg: {}, integer: boolean) => ({
      ...arg,
      integer,
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
  }, numberParser)
