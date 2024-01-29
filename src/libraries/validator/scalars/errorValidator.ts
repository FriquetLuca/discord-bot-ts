import type { Collapse } from "@/libraries/types"
import type { ParsedData, Schema } from "../schema"
import { assert } from "@/libraries/typeof"

type ErrorSchema<Data> = Schema<"error", Data>

export type ErrorValidator<Data> = {
  parse: (value: unknown) => Collapse<ParsedData<Data, Error>>
  getSchema: () => ErrorSchema<Data>
  optional: () => ErrorValidator<Omit<Data, "optional"> & { optional: true }>
  required: () => ErrorValidator<Omit<Data, "optional"> & { optional: false }>
  undefinable: () => ErrorValidator<Omit<Data, "undefinable"> & { undefinable: true }>
  definable: () => ErrorValidator<Omit<Data, "undefinable"> & { undefinable: false }>
  nullable: () => ErrorValidator<Omit<Data, "nullable"> & { nullable: true }>
  notnull: () => ErrorValidator<Omit<Data, "nullable"> & { nullable: false }>
}

const errorParser = <Data>(val: unknown, datas: Data): ParsedData<Data, Error> => {
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
  assert(val, "error")
  return val as any
}

export const errorValidatorConstructor = <Data>(data: Data): ErrorValidator<Data> => {
  return {
    parse: (value) => errorParser(value, data) as any,
    getSchema: () => ({
      type: "error",
      data,
    }),
    optional: () => errorValidatorConstructor({ ...data, optional: true }),
    required: () => errorValidatorConstructor({ ...data, optional: false }),
    undefinable: () => errorValidatorConstructor({ ...data, undefinable: true }),
    definable: () => errorValidatorConstructor({ ...data, undefinable: false }),
    nullable: () => errorValidatorConstructor({ ...data, nullable: true }),
    notnull: () => errorValidatorConstructor({ ...data, nullable: false }),
  }
}

export const errorValidator = () => errorValidatorConstructor({
  optional: false as false,
  nullable: false as false,
  undefinable: false as false,
})
