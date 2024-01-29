import type { Collapse } from "@/libraries/types"
import type { ParsedData, Schema } from "../schema"
import { assert } from "@/libraries/typeof"

type BooleanSchema<Data> = Schema<"boolean", Data>

export type BooleanValidator<Data> = {
  parse: (value: unknown) => Collapse<ParsedData<Data, Error>>
  getSchema: () => BooleanSchema<Data>
  checked: () => BooleanValidator<Omit<Data, "checked"> & { checked: true }>
  unchecked: () => BooleanValidator<Omit<Data, "checked"> & { checked: false }>
  anyCheck: () => BooleanValidator<Omit<Data, "checked"> & { checked: undefined }>
  optional: () => BooleanValidator<Omit<Data, "optional"> & { optional: true }>
  required: () => BooleanValidator<Omit<Data, "optional"> & { optional: false }>
  undefinable: () => BooleanValidator<Omit<Data, "undefinable"> & { undefinable: true }>
  definable: () => BooleanValidator<Omit<Data, "undefinable"> & { undefinable: false }>
  nullable: () => BooleanValidator<Omit<Data, "nullable"> & { nullable: true }>
  notnull: () => BooleanValidator<Omit<Data, "nullable"> & { nullable: false }>
}

const booleanParser = <Data>(val: unknown, datas: Data): ParsedData<Data, Data extends { checked: true } ? true : Data extends { checked: false } ? false : boolean> => {
  const {
    checked,
    undefinable,
    nullable,
  } = datas as any
  if(undefinable === true && val === undefined) {
    return val as any
  }
  if(nullable === true && val === null) {
    return val as any
  }
  assert(val, "boolean")
  if(checked === true && val !== true) { 
    throw new Error(`The boolean must be checked`)
  }
  if(checked === false && val !== false) { 
    throw new Error(`The boolean must be unchecked`)
  }
  return val as any
}

export const booleanValidatorConstructor = <Data>(data: Data): BooleanValidator<Data> => {
  return {
    parse: (value) => booleanParser(value, data) as any,
    getSchema: () => ({
      type: "boolean",
      data,
    }),
    checked: () => booleanValidatorConstructor({ ...data, checked: true }),
    unchecked: () => booleanValidatorConstructor({ ...data, checked: false }),
    anyCheck: () => booleanValidatorConstructor({ ...data, checked: undefined }),
    optional: () => booleanValidatorConstructor({ ...data, optional: true }),
    required: () => booleanValidatorConstructor({ ...data, optional: false }),
    undefinable: () => booleanValidatorConstructor({ ...data, undefinable: true }),
    definable: () => booleanValidatorConstructor({ ...data, undefinable: false }),
    nullable: () => booleanValidatorConstructor({ ...data, nullable: true }),
    notnull: () => booleanValidatorConstructor({ ...data, nullable: false }),
  }
}

export const booleanValidator = () => booleanValidatorConstructor({
  optional: false as false,
  nullable: false as false,
  undefinable: false as false,
})
