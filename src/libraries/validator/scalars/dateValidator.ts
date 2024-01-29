import type { Collapse } from "@/libraries/types"
import type { ParsedData, Schema } from "../schema"
import { assert } from "@/libraries/typeof"

type DateSchema<Data> = Schema<"date", Data>

export type DateValidator<Data> = {
  parse: (value: unknown) => Collapse<ParsedData<Data, Date>>
  getSchema: () => DateSchema<Data>
  optional: () => DateValidator<Omit<Data, "optional"> & { optional: true }>
  required: () => DateValidator<Omit<Data, "optional"> & { optional: false }>
  undefinable: () => DateValidator<Omit<Data, "undefinable"> & { undefinable: true }>
  definable: () => DateValidator<Omit<Data, "undefinable"> & { undefinable: false }>
  nullable: () => DateValidator<Omit<Data, "nullable"> & { nullable: true }>
  notnull: () => DateValidator<Omit<Data, "nullable"> & { nullable: false }>
}

const dateParser = <Data>(val: unknown, datas: Data): ParsedData<Data, Date> => {
  const {
    undefinable,
    nullable,
  } = datas as any
  if(undefinable === true && val === undefined) {
    return val as any
  }
  if(nullable === true && val === null) {
    return val as any
  }
  assert(val, "date")
  return val as any
}

export const dateValidatorConstructor = <Data>(data: Data): DateValidator<Data> => {
  return {
    parse: (value) => dateParser(value, data) as any,
    getSchema: () => ({
      type: "date",
      data,
    }),
    optional: () => dateValidatorConstructor({ ...data, optional: true }),
    required: () => dateValidatorConstructor({ ...data, optional: false }),
    undefinable: () => dateValidatorConstructor({ ...data, undefinable: true }),
    definable: () => dateValidatorConstructor({ ...data, undefinable: false }),
    nullable: () => dateValidatorConstructor({ ...data, nullable: true }),
    notnull: () => dateValidatorConstructor({ ...data, nullable: false }),
  }
}

export const dateValidator = () => dateValidatorConstructor({
  optional: false as false,
  nullable: false as false,
  undefinable: false as false,
})
