import { assert } from "@/libraries/typeof"
import type { Collapse, OmitFirstArg, OverrideReturnType } from "@/libraries/types"
import { type DataSchema } from "../schema"
import { type Parser } from "../composites"

type FilteredKeys<T> = { [K in keyof T]: T[K] extends never ? never : K }[keyof T]

type RemoveNever<T> = {
  [K in FilteredKeys<T>]: T[K]
}

type PickRequiredSchemaKeys<T> = keyof Omit<T, PickOptionalSchemaKeys<T>>

type PickOptionalSchemaKeys<T> = keyof RemoveNever<{ [K in keyof ExtractSchemaDatas<T>]: ExtractSchemaDatas<T>[K] extends {
  optional: true
} ? ExtractSchemaDatas<T>[K] : never }>

type ExtractSchemaDatas<T> = { [K in keyof T]: T[K] extends { "_datas": any } ? T[K]["_datas"] : never }

type MakeOptionalKeys<T, U extends keyof T> = Pick<T, U> & Partial<Omit<T, U>>

type ParsedSchema<S extends Record<string, Parser>> = Collapse<MakeOptionalKeys<{ [K in keyof S]: ReturnType<S[K]["parse"]> }, PickRequiredSchemaKeys<{ [K in keyof S]: ReturnType<S[K]["schema"]> }>>>

export type ObjectParserSchema<S extends Record<string, Parser>> = {
  objectSchema: S
  undefinable: boolean
  nullable: boolean
  optional: boolean
}

const objectParser = <S extends Record<string, Parser>, T extends ObjectParserSchema<S>>(val: unknown, datas: T): T["undefinable"] extends true
? (T["nullable"] extends true ? ParsedSchema<S> | null | undefined : ParsedSchema<S> | undefined)
: (T["nullable"] extends true ? ParsedSchema<S> | null : ParsedSchema<S>
 ) => {
  const {
    objectSchema,
    undefinable,
    nullable,
  } = datas
  if(undefinable === true && val === undefined) {
    return val as any
  }
  if(nullable === true && val === null) {
    return val as any
  }
  assert(val, "object")
  let objectKeys = Object.keys(val)
    for(const keyName of Object.keys(objectSchema)) {
      const currentItem = objectSchema[keyName]
      const currentSchema = currentItem.schema()
      if(currentSchema.optional === true && !objectKeys.includes(keyName)) {
        continue
      }
      const currentParser = currentItem.parse;
      if(keyName in val) {
        currentParser((val as any)[keyName])
      } else {
        throw new Error(`The key ${keyName} is not set`)
      }
      objectKeys = objectKeys.filter((key) => key !== keyName)
    }
    if(objectKeys.length > 0) {
      throw new Error(`The following keys: ${objectKeys.map((value, i, arr) => i === arr.length - 1 ? `and \`${value}\`` : `\`${value}\`, `)} has been found but are not part of the schema`)
    }
  return val as any
}

export type ObjectValidatorChain<S extends Record<string, Parser>, Prs extends <U>(value: unknown, arg: U) => any, T extends Record<string, (arg: U, ...args: any) => any>, U extends ObjectParserSchema<S>> = {
  [K in keyof T]: OverrideReturnType<OmitFirstArg<T[K]>, ObjectValidatorChain<S, Prs, T, Collapse<U & ReturnType<OmitFirstArg<T[K]>>>>>
} & {
  schema: () => DataSchema<"object", (value: unknown) => ReturnType<typeof objectParser<S, U>>, U>
  parse: (value: unknown) => ReturnType<typeof objectParser<S, U>>
}

function baseObjectValidator<S extends Record<string, Parser>, Prs extends (value: unknown, arg: any) => any, T extends Record<string, (arg: U, ...args: any) => any>, U extends ObjectParserSchema<S>>(fns: T, arg: U, parse: Prs) {
  const patchFns = {} as any
  for(const fnKey in fns) {
    const fn = fns[fnKey]
    patchFns[fnKey] = (...args: any) => baseObjectValidator(fns, fn(arg, ...args), parse)
  }
  return {
    ...patchFns,
    schema: () => ({ "_type": "object", "_parser": (value: unknown) => parse(value, arg), "_datas": arg }),
    parse: (value: unknown) => parse(value, arg),
  } as ObjectValidatorChain<S, Prs, T, U>
}

export const objectValidator = <S extends Record<string, Parser>>(objectSchema: S) => {
  const fns = {
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
  }
  type Default<S> = {
    objectSchema: S,
    optional: false,
    undefinable: false,
    nullable: false
  }
  return baseObjectValidator<S, typeof objectParser<S, Default<S>>, typeof fns, Default<S>>(fns, {
    objectSchema,
    optional: false as false,
    undefinable: false as false,
    nullable: false as false
  }, objectParser<S, Default<S>>)
}
