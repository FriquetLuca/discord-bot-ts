import { stringValidator, numberValidator, bigintValidator, booleanValidator, dateValidator, errorValidator } from "./scalars"
import { arrayValidator, objectValidator } from "./composites"

export type DataSchemaScalarTypes = "string" | "number" | "undefined" | "null" | "date" | "error" | "boolean" | "bigint"
export type DataSchemaTypes = DataSchemaScalarTypes | "object" | "array"
export type DataSchema<T extends DataSchemaTypes, Parser extends (...args: any) => any, Datas> = { "_type": T, "_parser": Parser, "_datas": Datas }

export const validator = {
  error: errorValidator,
  date: dateValidator,
  boolean: booleanValidator,
  bigint: bigintValidator,
  string: stringValidator,
  number: numberValidator,
  object: objectValidator,
  array: arrayValidator,
}
