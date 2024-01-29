import { assert } from "@/libraries/typeof"
import type { Collapse } from "@/libraries/types"
import type { ElementShape, ComplexSchema } from "../schema"
import { minMaxLengthError, greaterLessLengthError } from "../errors"

export type ArraySchema<T extends ElementShape, Data> = ComplexSchema<T, "array", Data>

export type ArrayValidator<T extends ElementShape, Data> = {
  parse: (value: unknown) => Collapse<ReturnType<T["parse"]>>[]
  getSchema: () => ArraySchema<T, Data>
  min: (min: number) => ArrayValidator<T, Omit<Data, "min"> & { min: number }>
  max: (max: number) => ArrayValidator<T, Omit<Data, "max"> & { max: number }>
  less: (less: number) => ArrayValidator<T, Omit<Data, "less"> & { less: number }>
  greater: (greater: number) => ArrayValidator<T, Omit<Data, "greater"> & { greater: number }>
  empty: () => ArrayValidator<T, Omit<Data, "empty"> & { empty: true }>,
  notEmpty: () => ArrayValidator<T, Omit<Data, "empty"> & { empty: false }>,
  anyElements: () => ArrayValidator<T, Omit<Data, "empty"> & { empty: undefined }>,
  optional: () => ArrayValidator<T, Omit<Data, "optional"> & { optional: true }>
  required: () => ArrayValidator<T, Omit<Data, "optional"> & { optional: false }>
  undefinable: () => ArrayValidator<T, Omit<Data, "undefinable"> & { undefinable: true }>
  definable: () => ArrayValidator<T, Omit<Data, "undefinable"> & { undefinable: false }>
  nullable: () => ArrayValidator<T, Omit<Data, "nullable"> & { nullable: true }>
  notnull: () => ArrayValidator<T, Omit<Data, "nullable"> & { nullable: false }>
}

const arrayParser = <Data>(val: unknown, datas: Data) => {
  const {
    schema,
    min,
    max,
    greater,
    less,
    empty,
    undefinable,
    nullable,
  } = datas as any
  if(undefinable === true && val === undefined) {
    return val as any
  }
  if(nullable === true && val === null) {
    return val as any
  }
  assert(val, "array")
  if(empty === true && val.length !== 0) {
    throw new Error(`The array must be empty`)
  }
  if(empty === false && val.length === 0) {
    throw new Error(`The array can't be empty`)
  }
  minMaxLengthError(val, min, max)
  greaterLessLengthError(val, greater, less)
  for(let i = 0; i < val.length; i++) {
    schema.parse(val[i])
  }
  return val as any
}

export const arrayValidatorConstructor = <T extends ElementShape, Data>(schema: T, data: Data): ArrayValidator<T, Data> => {
  return {
    parse: (value) => arrayParser(value, { ...data, schema }),
    getSchema: () => ({
      type: "array",
      data,
      schema,
    }),
    min: (min: number) => arrayValidatorConstructor(schema, { ...data, min }),
    max: (max: number) => arrayValidatorConstructor(schema, { ...data, max }),
    less: (less: number) => arrayValidatorConstructor(schema, { ...data, less }),
    greater: (greater: number) => arrayValidatorConstructor(schema, { ...data, greater }),
    empty: () => arrayValidatorConstructor(schema, { ...data, empty: true }),
    notEmpty: () => arrayValidatorConstructor(schema, { ...data, empty: false }),
    anyElements: () => arrayValidatorConstructor(schema, { ...data, empty: undefined }),
    optional: () => arrayValidatorConstructor(schema, { ...data, optional: true }),
    required: () => arrayValidatorConstructor(schema, { ...data, optional: false }),
    undefinable: () => arrayValidatorConstructor(schema, { ...data, undefinable: true }),
    definable: () => arrayValidatorConstructor(schema, { ...data, undefinable: false }),
    nullable: () => arrayValidatorConstructor(schema, { ...data, nullable: true }),
    notnull: () => arrayValidatorConstructor(schema, { ...data, nullable: false }),
  }
}

export const arrayValidator = <T extends ElementShape>(schema: T) => arrayValidatorConstructor(schema, {
  optional: false as false,
  nullable: false as false,
  undefinable: false as false,
})
