import type { Collapse } from "@/libraries/types"
import type { ParsedData, Schema } from "../schema"
import { assert } from "@/libraries/typeof"
import { greaterLessError, integerError, minMaxError } from "../errors"

type NumberSchema<Data> = Schema<"number", Data>

export type NumberValidator<Data> = {
  parse: (value: unknown) => Collapse<ParsedData<Data, number>>
  getSchema: () => NumberSchema<Data>
  min: (min: number) => NumberValidator<Omit<Data, "min"> & { min: number }>
  max: (max: number) => NumberValidator<Omit<Data, "max"> & { max: number }>
  less: (less: number) => NumberValidator<Omit<Data, "less"> & { less: number }>
  greater: (greater: number) => NumberValidator<Omit<Data, "greater"> & { greater: number }>
  integer: () => NumberValidator<Omit<Data, "integer"> & { integer: true }>
  hasDecimals: () => NumberValidator<Omit<Data, "integer"> & { integer: false }>
  anyNumber: () => NumberValidator<Omit<Data, "integer"> & { integer: undefined }>
  optional: () => NumberValidator<Omit<Data, "optional"> & { optional: true }>
  required: () => NumberValidator<Omit<Data, "optional"> & { optional: false }>
  undefinable: () => NumberValidator<Omit<Data, "undefinable"> & { undefinable: true }>
  definable: () => NumberValidator<Omit<Data, "undefinable"> & { undefinable: false }>
  nullable: () => NumberValidator<Omit<Data, "nullable"> & { nullable: true }>
  notnull: () => NumberValidator<Omit<Data, "nullable"> & { nullable: false }>
}

const numberParser = <Data>(val: unknown, datas: Data): ParsedData<Data, number> => {
  const {
    integer,
    less,
    greater,
    min,
    max,
    undefinable,
    nullable,
  } = datas as any
  if(undefinable === true && val === undefined) {
    return val as any
  }
  if(nullable === true && val === null) {
    return val as any
  }
  assert(val, "number")
  integerError(val, integer)
  minMaxError(val, min, max)
  greaterLessError(val, greater, less)
  return val as any
}

export const numberValidatorConstructor = <Data>(data: Data): NumberValidator<Data> => {
  return {
    parse: (value) => numberParser(value, data) as any,
    getSchema: () => ({
      type: "number",
      data: data as any,
    }),
    min: (min: number) => numberValidatorConstructor({ ...data, min }),
    max: (max: number) => numberValidatorConstructor({ ...data, max }),
    less: (less: number) => numberValidatorConstructor({ ...data, less }),
    greater: (greater: number) => numberValidatorConstructor({ ...data, greater }),
    integer: () => numberValidatorConstructor({ ...data, integer: true }),
    hasDecimals: () => numberValidatorConstructor({ ...data, integer: false }),
    anyNumber: () => numberValidatorConstructor({ ...data, integer: undefined }),
    optional: () => numberValidatorConstructor({ ...data, optional: true }),
    required: () => numberValidatorConstructor({ ...data, optional: false }),
    undefinable: () => numberValidatorConstructor({ ...data, undefinable: true }),
    definable: () => numberValidatorConstructor({ ...data, undefinable: false }),
    nullable: () => numberValidatorConstructor({ ...data, nullable: true }),
    notnull: () => numberValidatorConstructor({ ...data, nullable: false }),
  }
}

export const numberValidator = () => numberValidatorConstructor({
  min: undefined as undefined,
  max: undefined as undefined,
  less: undefined as undefined,
  greater: undefined as undefined,
  integer: undefined as undefined,
  optional: false as false,
  nullable: false as false,
  undefinable: false as false,
})
