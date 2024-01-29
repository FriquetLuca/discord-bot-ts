import { assert } from "@/libraries/typeof"
import type { Collapse, RemoveNever } from "@/libraries/types"
import type { ComplexSchema, ElementShape } from "../schema"
import { fromRecord } from "@/libraries/sqeul"

export type ObjectSchema<T extends Record<string, ElementShape>, Data> = ComplexSchema<T, "object", Data>
type ObjectValidatorDatasValues<T extends Record<string, ElementShape>> = { [K in keyof T]: ReturnType<T[K]["parse"]> }
type OptionalValidatorSchemas<T extends Record<string, ElementShape>> = RemoveNever<{ [K in keyof T]: ReturnType<T[K]["getSchema"]>["data"]["optional"] extends true ? true : never }>
type ParseObjectValidatorDatas<T extends Record<string, ElementShape>> = Partial<Pick<ObjectValidatorDatasValues<T>, keyof OptionalValidatorSchemas<T>>> & Omit<ObjectValidatorDatasValues<T>, keyof OptionalValidatorSchemas<T>>

export type ObjectValidator<T extends Record<string, ElementShape>, Data> = {
  parse: (value: unknown) => Collapse<ParseObjectValidatorDatas<T>>
  getSchema: () => ObjectSchema<T, Data>
  merge: <U extends Record<string, ElementShape>>(mergeSchema: U) => ObjectValidator<Omit<T, keyof U> & U, Data>
  pick: <U extends keyof T>(...keys: U[]) => ObjectValidator<Pick<T, U>, Data>
  omit: <U extends keyof T>(...keys: U[]) => ObjectValidator<Omit<T, U>, Data>
  safe: () => ObjectValidator<T, Omit<Data, "unsafe"> & { unsafe: false }>
  unsafe: () => ObjectValidator<T, Omit<Data, "unsafe"> & { unsafe: true }>
  optional: () => ObjectValidator<T, Omit<Data, "optional"> & { optional: true }>
  required: () => ObjectValidator<T, Omit<Data, "optional"> & { optional: false }>
  undefinable: () => ObjectValidator<T, Omit<Data, "undefinable"> & { undefinable: true }>
  definable: () => ObjectValidator<T, Omit<Data, "undefinable"> & { undefinable: false }>
  nullable: () => ObjectValidator<T, Omit<Data, "nullable"> & { nullable: true }>
  notnull: () => ObjectValidator<T, Omit<Data, "nullable"> & { nullable: false }>
}

const objectParser = <Data>(val: unknown, datas: Data) => {
  const {
    schema,
    unsafe,
    undefinable,
    nullable,
  } = datas as any
  if(undefinable === true && val === undefined) {
    return val as any
  }
  if(nullable === true && val === null) {
    return val as any
  }
  assert(val, "object")
  let objectKeys = Object.keys(val)
  for(const keyName of Object.keys(schema)) {
    const currentItem = schema[keyName]
    const currentSchema = currentItem.getSchema()
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
  if(unsafe !== true && objectKeys.length > 0) {
    throw new Error(`The following keys: ${objectKeys.map((value, i, arr) => i === arr.length - 1 ? `and \`${value}\`` : `\`${value}\`, `)} has been found but are not part of the schema`)
  }
  return val as any
}
// intersection type needed, everything else is a union anyway
export const objectValidatorConstructor = <T extends Record<string, ElementShape>, Data>(schema: T, data: Data): ObjectValidator<T, Data> => {
  return {
    parse: (value) => objectParser(value, { ...data, schema }),
    getSchema: () => ({
      type: "object",
      data,
      schema,
    }),
    merge: <U extends Record<string, ElementShape>>(mergeSchema: U) => objectValidatorConstructor({
      ...schema,
      ...mergeSchema,
    }, data) as any,
    pick: <U extends keyof T>(...keys: U[]) => objectValidatorConstructor(fromRecord(schema).pick(...keys).get(), data),
    omit: <U extends keyof T>(...keys: U[]) => objectValidatorConstructor(fromRecord(schema).omit(...keys).get(), data),
    unsafe: () => objectValidatorConstructor(schema, { ...data, unsafe: true }),
    safe: () => objectValidatorConstructor(schema, { ...data, unsafe: false }),
    optional: () => objectValidatorConstructor(schema, { ...data, optional: true }),
    required: () => objectValidatorConstructor(schema, { ...data, optional: false }),
    undefinable: () => objectValidatorConstructor(schema, { ...data, undefinable: true }),
    definable: () => objectValidatorConstructor(schema, { ...data, undefinable: false }),
    nullable: () => objectValidatorConstructor(schema, { ...data, nullable: true }),
    notnull: () => objectValidatorConstructor(schema, { ...data, nullable: false }),
  }
}

export const objectValidator = <T extends Record<string, ElementShape>>(schema: T) => objectValidatorConstructor(schema, {
  unsafe: false as false,
  optional: false as false,
  nullable: false as false,
  undefinable: false as false,
})
