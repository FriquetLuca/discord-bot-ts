import type { Collapse } from "@/libraries/types"
import type { ParsedData, Schema } from "../schema"
import { assert } from "@/libraries/typeof"
import { greaterLessLengthError, lengthError, minMaxLengthError, regexpTest } from "../errors"

type StringSchema<Data> = Schema<"string", Data>

export type StringValidator<Data> = {
  parse: (value: unknown) => Collapse<ParsedData<Data, string>>
  getSchema: () => StringSchema<Data>
  min: (min: number) => StringValidator<Omit<Data, "min"> & { min: number }>,
  max: (max: number) => StringValidator<Omit<Data, "max"> & { max: number }>,
  less: (less: number) => StringValidator<Omit<Data, "less"> & { less: number }>
  greater: (greater: number) => StringValidator<Omit<Data, "greater"> & { greater: number }>
  length: (length: number) => StringValidator<Omit<Data, "length"> & { length: number }>,
  regex: (regex: RegExp) => StringValidator<Omit<Data, "regex"> & { regex: RegExp }>,
  optional: () => StringValidator<Omit<Data, "optional"> & { optional: true }>
  required: () => StringValidator<Omit<Data, "optional"> & { optional: false }>
  undefinable: () => StringValidator<Omit<Data, "undefinable"> & { undefinable: true }>
  definable: () => StringValidator<Omit<Data, "undefinable"> & { undefinable: false }>
  nullable: () => StringValidator<Omit<Data, "nullable"> & { nullable: true }>
  notnull: () => StringValidator<Omit<Data, "nullable"> & { nullable: false }>
}

const stringParser = <Data>(val: unknown, datas: Data): ParsedData<Data, string> => {
  const {
    min,
    max,
    less,
    greater,
    length,
    regex,
    undefinable,
    nullable,
  } = datas as any
  if(undefinable === true && val === undefined) {
    return val as any
  }
  if(nullable === true && val === null) {
    return val as any
  }
  assert(val, "string")
  lengthError(val, length)
  minMaxLengthError(val, min, max)
  greaterLessLengthError(val, greater, less)
  regexpTest(regex, val)
  return val as any
}

export const stringValidatorConstructor = <Data>(data: Data): StringValidator<Data> => {
  return {
    parse: (value) => stringParser(value, data) as any,
    getSchema: () => ({
      type: "string",
      data,
    }),
    min: (min: number) => stringValidatorConstructor({ ...data, min }),
    max: (max: number) => stringValidatorConstructor({ ...data, max }),
    less: (less: number) => stringValidatorConstructor({ ...data, less }),
    greater: (greater: number) => stringValidatorConstructor({ ...data, greater }),
    length: (length: number) => stringValidatorConstructor({ ...data, length }),
    regex: (regex: RegExp) => stringValidatorConstructor({ ...data, regex }),
    optional: () => stringValidatorConstructor({ ...data, optional: true }),
    required: () => stringValidatorConstructor({ ...data, optional: false }),
    undefinable: () => stringValidatorConstructor({ ...data, undefinable: true }),
    definable: () => stringValidatorConstructor({ ...data, undefinable: false }),
    nullable: () => stringValidatorConstructor({ ...data, nullable: true }),
    notnull: () => stringValidatorConstructor({ ...data, nullable: false }),
  }
}

export const stringValidator = () => stringValidatorConstructor({
  optional: false as false,
  nullable: false as false,
  undefinable: false as false,
})
