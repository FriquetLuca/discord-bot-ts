import type { Collapse } from "@/libraries/types"
import type { ParsedData, Schema } from "../schema"
import { assert } from "@/libraries/typeof"
import { greaterLessError, minMaxError } from "../errors"

type NumberSchema<Data> = Schema<"number", Data>

export type NumberValidator<Data> = {
  parse: (value: unknown) => Collapse<ParsedData<Data, number>>
  getSchema: () => NumberSchema<Data>
  min: (min: number) => NumberValidator<Omit<Data, "min"> & { min: number }>
  max: (max: number) => NumberValidator<Omit<Data, "max"> & { max: number }>
  less: (less: number) => NumberValidator<Omit<Data, "less"> & { less: number }>
  greater: (greater: number) => NumberValidator<Omit<Data, "greater"> & { greater: number }>
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
  minMaxError(val, min, max)
  greaterLessError(val, less, greater)
  return val as any
}

export const numberValidatorConstructor = <Data>(data: Data): NumberValidator<Data> => {
  return {
    parse: (value) => numberParser(value, data) as any,
    getSchema: () => ({
      type: "number",
      data,
    }),
    min: (min: number) => numberValidatorConstructor({ ...data, min }),
    max: (max: number) => numberValidatorConstructor({ ...data, max }),
    less: (less: number) => numberValidatorConstructor({ ...data, less }),
    greater: (greater: number) => numberValidatorConstructor({ ...data, greater }),
    optional: () => numberValidatorConstructor({ ...data, optional: true }),
    required: () => numberValidatorConstructor({ ...data, optional: false }),
    undefinable: () => numberValidatorConstructor({ ...data, undefinable: true }),
    definable: () => numberValidatorConstructor({ ...data, undefinable: false }),
    nullable: () => numberValidatorConstructor({ ...data, nullable: true }),
    notnull: () => numberValidatorConstructor({ ...data, nullable: false }),
  }
}

export const numberValidator = () => numberValidatorConstructor({
  optional: false as false,
  nullable: false as false,
  undefinable: false as false,
})
