import { assert } from "@/libraries/typeof"
import type { Collapse, OmitFirstArg, OverrideReturnType } from "@/libraries/types"
import { type DataSchema } from "../schema"

export type StringParserSchema = {
  min?: number
  max?: number
  length?: number
  regex?: RegExp
  undefinable: boolean
  optional: boolean
  nullable: boolean
}

const stringParser = <T extends StringParserSchema>(val: unknown, datas: T): T["undefinable"] extends true
? (T["nullable"] extends true ? string | null | undefined : string | undefined)
: (T["nullable"] extends true ? string | null : string
) => {
  const {
    min,
    max,
    length,
    regex,
    undefinable,
    nullable,
  } = datas
  if(undefinable === true && val === undefined) {
    return val as any
  }
  if(nullable === true && val === null) {
    return val as any
  }
  assert(val, "string")
  const regexpTest = (value: string) => {
    if(regex) {
      const result = regex.exec(value)
      if(result === null) {
        throw new Error(`The \`regex\` didn't match the value: \`${value}\``)
      }
      return value
    }
    return value
  }
  if(length !== undefined) {
    if(val.length !== length) {
      throw new Error(`The \`length\` of the string must be equal to ${length}`)
    }
    return regexpTest(val) as any
  }
  if(min !== undefined) { 
    if(max !== undefined) {
      if(val.length < min || val.length > max) {
        throw new Error(`The \`length\` of the string must be greater or equal to ${min} and less than ${max}`)
      }
      return regexpTest(val) as any
    }
    if(val.length < min) {
      throw new Error(`The \`length\` of the string must be greater or equal to ${min}`)
    }
    return regexpTest(val) as any
  }
  if(max !== undefined) {
    if(val.length > max) {
      throw new Error(`The \`length\` of the string must be less or equal to ${max}`)
    }
    return regexpTest(val) as any
  }
  return regexpTest(val) as any
}

export type StringValidatorChain<Prs extends <U>(value: unknown, arg: U) => any, T extends Record<string, (arg: U, ...args: any) => any>, U extends StringParserSchema> = {
  [K in keyof T]: OverrideReturnType<OmitFirstArg<T[K]>, StringValidatorChain<Prs, T, Collapse<U & ReturnType<OmitFirstArg<T[K]>>>>>
} & {
  schema: () => DataSchema<"string", (value: unknown) => ReturnType<typeof stringParser<U>>, U>
  parse: (value: unknown) => ReturnType<typeof stringParser<U>>
}

function baseStringValidator<Prs extends (value: unknown, arg: any) => any, T extends Record<string, (arg: U, ...args: any) => any>, U extends StringParserSchema>(fns: T, arg: U, parse: Prs) {
  const patchFns = {} as any
  for(const fnKey in fns) {
    const fn = fns[fnKey]
    patchFns[fnKey] = (...args: any) => baseStringValidator(fns, fn(arg, ...args), parse)
  }
  return {
    ...patchFns,
    schema: () => ({ "_type": "string", "_parser": (value: unknown) => parse(value, arg), "_datas": arg }),
    parse: (value: unknown) => parse(value, arg),
  } as StringValidatorChain<Prs, T, U>
}

export const stringValidator = () => baseStringValidator({
    min: (arg: {}, minValue: number) => ({
      ...arg,
      min: minValue < 0 ? 0 : minValue,
    }),
    max: (arg: {}, maxValue: number) => ({
      ...arg,
      max: maxValue < 0 ? 0 : maxValue,
    }),
    length: (arg: {}, length: number) => ({
      ...arg,
      length,
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
    regex: (arg: {}, regex: RegExp) => ({
      ...arg,
      regex,
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
  }, stringParser)
