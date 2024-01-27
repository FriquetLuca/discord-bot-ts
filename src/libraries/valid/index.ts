import { validator } from "./schema"
import type {
  BigintParserSchema,
  BigintValidatorChain,
  BooleanParserSchema,
  BooleanValidatorChain,
  DateParserSchema,
  DateValidatorChain,
  ErrorParserSchema,
  ErrorValidatorChain,
  NumberParserSchema,
  NumberValidatorChain,
  ObjectParserSchema,
  ObjectValidatorChain,
  StringParserSchema,
  StringValidatorChain,
} from "./scalars"
import { type Parser } from "./composites"

type ScalarParserSchema<S extends Record<string, Parser> = any> = BigintParserSchema | BooleanParserSchema | DateParserSchema | ErrorParserSchema | ObjectParserSchema<S> | NumberParserSchema | StringParserSchema

type ScalarValidatorChain<
  S extends Record<string, Parser>,
  Prs extends <U>(value: unknown, arg: U) => any,
  T extends Record<string, (arg: U, ...args: any) => any>,
  U extends ScalarParserSchema<S>
> = U extends BigintParserSchema
  ? BigintValidatorChain<Prs, T, U>
  : U extends BooleanParserSchema
    ? BooleanValidatorChain<Prs, T, U>
    : U extends DateParserSchema
      ? DateValidatorChain<Prs, T, U>
      : U extends ErrorParserSchema 
        ? ErrorValidatorChain<Prs, T, U>
          : U extends NumberParserSchema 
            ? NumberValidatorChain<Prs, T, U>
            : U extends StringParserSchema
              ? StringValidatorChain<Prs, T, U>
              : U extends ObjectParserSchema<any>
                ? ObjectValidatorChain<S, Prs, T, U>
                : unknown

export type {
  BigintParserSchema,
  BigintValidatorChain,
  BooleanParserSchema,
  BooleanValidatorChain,
  DateParserSchema,
  DateValidatorChain,
  ErrorParserSchema,
  ErrorValidatorChain,
  NumberParserSchema,
  NumberValidatorChain,
  ObjectParserSchema,
  ObjectValidatorChain,
  StringParserSchema,
  StringValidatorChain,
  ScalarParserSchema,
  ScalarValidatorChain,
}

export const v = validator
