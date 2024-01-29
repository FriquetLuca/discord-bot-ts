import { stringValidator, numberValidator, bigintValidator, booleanValidator, dateValidator, errorValidator, errorValidatorConstructor, dateValidatorConstructor, booleanValidatorConstructor, bigintValidatorConstructor, stringValidatorConstructor, numberValidatorConstructor } from "./scalars"
import type { StringValidator, NumberValidator, BigintValidator, BooleanValidator, DateValidator, ErrorValidator } from "./scalars"
import { arrayValidator, arrayValidatorConstructor, objectValidator, objectValidatorConstructor } from "./composites"
import type { ArrayValidator, ObjectValidator } from "./composites"
import { unionValidator } from "./logics"

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

export type AnySchema = Schema<any, any> | ComplexSchema<any, any, any>

type Validators<T extends ExtractSchema<AnySchema>> = T extends { type: ComplexType }
  ? (
      T extends { type: "object", data: infer d, schema: Record<string, ElementShape> }
        ? ObjectValidator<T["schema"], d>
        : T extends { type: "array", data: infer d, schema: ElementShape }
          ? ArrayValidator<T["schema"], d>
          : never
    )
  : (
    T extends { type: "bigint", data: infer d }
      ? BigintValidator<d>
      : T extends { type: "boolean", data: infer d }
        ? BooleanValidator<d>
        : T extends { type: "date", data: infer d }
          ? DateValidator<d>
          : T extends { type: "date", data: infer d }
            ? DateValidator<d>
              : T extends { type: "error", data: infer d }
                ? ErrorValidator<d>
                  : T extends { type: "number", data: infer d }
                    ? NumberValidator<d>
                    : T extends { type: "string", data: infer d }
                      ? StringValidator<d>
                      : never
  );

type ExtractSchema<AnySchemas extends AnySchema> = AnySchemas extends { type: ComplexType, schema: any } ? ComplexSchema<AnySchemas["schema"], AnySchemas["type"], AnySchemas["data"]> : AnySchemas extends { type: ScalarType, schema: any } ? Schema<AnySchemas["type"], AnySchemas["data"]> : never

export type ElementShape = {
  parse: (value: unknown) => any
  getSchema: () => any
}

export type ParsedData<Data, Expected> = Data extends { undefined: true }
  ? (Data extends { nullable: true } ? Expected | null | undefined : Expected | undefined)
  : (Data extends { nullable: true } ? Expected | null : Expected)

export type infer<T> = T extends ElementShape ? ReturnType<T["parse"]> : T extends AnySchema ? ReturnType<Validators<ExtractSchema<T>>["parse"]> : T extends ExtractSchema<AnySchema> ? ReturnType<Validators<T>["parse"]> : never

export const fromSchema = <T extends AnySchema>(schema: T): Validators<ExtractSchema<T>> => {
  switch(schema.type) {
    // Composites
    case "array":
      return arrayValidatorConstructor((schema as any).schema, schema.data) as any
    case "object":
      return objectValidatorConstructor((schema as any).schema, schema.data) as any
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
