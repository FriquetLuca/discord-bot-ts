import { stringValidator, numberValidator, bigintValidator, booleanValidator, dateValidator, errorValidator, errorValidatorConstructor, dateValidatorConstructor, booleanValidatorConstructor, bigintValidatorConstructor, stringValidatorConstructor, numberValidatorConstructor } from "./scalars"
import type { StringValidator, NumberValidator, BigintValidator, BooleanValidator, DateValidator, ErrorValidator } from "./scalars"
import { arrayValidator, arrayValidatorConstructor, fromObjectSchema, objectValidator } from "./composites"
import type { ArrayValidator, ObjectValidator } from "./composites"
import { unionValidator } from "./logics"
import { Collapse } from "../types"

export type ScalarType = "string" | "number" | "undefined" | "null" | "date" | "error" | "boolean" | "bigint"

export type ComplexType = "object" | "array"

export type SchemaType = ScalarType | ComplexType

export type Schema<Type extends ScalarType, Data> = {
  type: Type
  data: Data
}

export type ComplexSchema<AnySchema, Type extends ComplexType, Data> = {
  type: Type
  data: Data
  schema: AnySchema
}

export type AnySchema = Schema<ScalarType, any> | ComplexSchema<any, ComplexType, any>

export type ExtractSchema<AnySchemas extends AnySchema> = AnySchemas extends { type: ComplexType, data: any, schema: any }
  ? ComplexSchema<AnySchemas["schema"], AnySchemas["type"], AnySchemas["data"]>
  : AnySchemas extends { type: ScalarType, data: any }
    ? Collapse<Schema<AnySchemas["type"], AnySchemas["data"]>>
    : never

export type ElementShape = {
  parse: (value: unknown) => any
  getSchema: () => any
}

export type ParsedData<Data, Expected> = Data extends { undefinable: true }
  ? (Data extends { nullable: true } ? Expected | null | undefined : Expected | undefined)
  : (Data extends { nullable: true } ? Expected | null : Expected)

export type infer<T> = T extends ElementShape ? ReturnType<T["parse"]> : T extends AnySchema ? ReturnType<FromSchema<T>["parse"]> : never

export type FromSchema<T> = T extends { type: "object", schema: infer A, data: infer B }
  ? ObjectValidator<{ [K in keyof A]: FromSchema<A[K]> }, B>
  : T extends { type: "bigint", data: infer d }
    ? BigintValidator<d>
    : T extends { type: "boolean", data: infer d }
      ? BooleanValidator<d>
      : T extends { type: "date", data: infer d }
        ? DateValidator<d>
        : T extends { type: "error", data: infer d }
          ? ErrorValidator<d>
            : T extends { type: "number", data: infer d }
              ? NumberValidator<d>
              : T extends { type: "string", data: infer d }
                ? StringValidator<d>
                : never

export const fromSchema = <T extends AnySchema>(schema: T): FromSchema<T> => {
  switch(schema.type) {
    // Composites
    case "array":
      return arrayValidatorConstructor(fromSchema((schema as any).schema), schema.data) as any
    case "object":
      return fromObjectSchema(schema as any) as any
    // Logics
    // Scalars
    case "bigint":
      return bigintValidatorConstructor(schema.data) as any
    case "boolean":
      return booleanValidatorConstructor(schema.data) as any
    case "date":
      return dateValidatorConstructor(schema.data) as any
    case "error":
      return errorValidatorConstructor(schema.data) as any
    case "number":
      return numberValidatorConstructor(schema.data) as any
    case "string":
      return stringValidatorConstructor(schema.data) as any
  }
  throw new Error("Unknown schema")
}
export const array = arrayValidator
export const bigint = bigintValidator
export const boolean = booleanValidator
export const date = dateValidator
export const error = errorValidator
export const number = numberValidator
export const object = objectValidator
export const union = unionValidator
export const string = stringValidator
