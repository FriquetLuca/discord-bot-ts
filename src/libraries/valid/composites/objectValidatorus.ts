import { assert } from "@/libraries/typeof"
import { type Parser } from "."
import { Collapse } from "@/libraries/types"

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

export function objectValidator<S extends Record<string, Parser>>(objectSchema: S) {
  function validate(arg: unknown): asserts arg is ParsedSchema<S> {
    assert(arg, "object")
    let objectKeys = Object.keys(arg)
    for(const keyName of Object.keys(objectSchema)) {
      const currentItem = objectSchema[keyName]
      const currentSchema = currentItem.schema()
      if(currentSchema.optional === true && !objectKeys.includes(keyName)) {
        continue
      }
      const currentParser = currentItem.parse;
      if(keyName in arg) {
        currentParser((arg as any)[keyName])
      } else {
        throw new Error(`The key ${keyName} is not set`)
      }
      objectKeys = objectKeys.filter((key) => key !== keyName)
    }
    if(objectKeys.length > 0) {
      throw new Error(`The following keys: ${objectKeys.map((value, i, arr) => i === arr.length - 1 ? `and \`${value}\`` : `\`${value}\`, `)} has been found but are not part of the schema`)
    }
  }
  return {
    optional: () => ({
      parse(arg: unknown): ParsedSchema<S> | undefined {
        if(arg === undefined) {
          return undefined
        }
        validate(arg)
        return arg
      }
    }),
    parse(arg: unknown) {
      validate(arg)
      return arg
    }
  }
}