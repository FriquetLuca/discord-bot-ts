import type { Collapse } from "@/libraries/types"
import type { ParsedData, Schema } from "../schema"
import { assert } from "@/libraries/typeof"
import { greaterLessError, minMaxError } from "../errors"

type BigintSchema<Data> = Schema<"bigint", Data>

export type BigintValidator<Data> = {
  parse: (value: unknown) => Collapse<ParsedData<Data, bigint>>
  getSchema: () => BigintSchema<Data>
  min: (min: bigint) => BigintValidator<Omit<Data, "min"> & { min: bigint }>
  max: (max: bigint) => BigintValidator<Omit<Data, "max"> & { max: bigint }>
  less: (less: bigint) => BigintValidator<Omit<Data, "less"> & { less: bigint }>
  greater: (greater: bigint) => BigintValidator<Omit<Data, "greater"> & { greater: bigint }>
  optional: () => BigintValidator<Omit<Data, "optional"> & { optional: true }>
  required: () => BigintValidator<Omit<Data, "optional"> & { optional: false }>
  undefinable: () => BigintValidator<Omit<Data, "undefinable"> & { undefinable: true }>
  definable: () => BigintValidator<Omit<Data, "undefinable"> & { undefinable: false }>
  nullable: () => BigintValidator<Omit<Data, "nullable"> & { nullable: true }>
  notnull: () => BigintValidator<Omit<Data, "nullable"> & { nullable: false }>
}

const bigintParser = <Data>(val: unknown, datas: Data): ParsedData<Data, bigint> => {
  const {
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
  assert(val, "bigint")
  minMaxError(val, min, max)
  greaterLessError(val, greater, less)
  return val as any
}

export const bigintValidatorConstructor = <Data>(data: Data): BigintValidator<Data> => {
  return {
    parse: (value) => bigintParser(value, data) as any,
    getSchema: () => ({
      type: "bigint",
      data,
    }),
    min: (min: bigint) => bigintValidatorConstructor({ ...data, min }),
    max: (max: bigint) => bigintValidatorConstructor({ ...data, max }),
    less: (less: bigint) => bigintValidatorConstructor({ ...data, less }),
    greater: (greater: bigint) => bigintValidatorConstructor({ ...data, greater }),
    optional: () => bigintValidatorConstructor({ ...data, optional: true }),
    required: () => bigintValidatorConstructor({ ...data, optional: false }),
    undefinable: () => bigintValidatorConstructor({ ...data, undefinable: true }),
    definable: () => bigintValidatorConstructor({ ...data, undefinable: false }),
    nullable: () => bigintValidatorConstructor({ ...data, nullable: true }),
    notnull: () => bigintValidatorConstructor({ ...data, nullable: false }),
  }
}

export const bigintValidator = () => bigintValidatorConstructor({
  min: undefined as undefined,
  max: undefined as undefined,
  less: undefined as undefined,
  greater: undefined as undefined,
  optional: false as false,
  nullable: false as false,
  undefinable: false as false,
})
