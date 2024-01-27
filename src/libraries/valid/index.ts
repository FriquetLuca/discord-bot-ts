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
  StringParserSchema,
  StringValidatorChain,
} from "./scalars"

type ScalarParserSchema = BigintParserSchema | BooleanParserSchema | DateParserSchema | ErrorParserSchema | NumberParserSchema | StringParserSchema

type ScalarValidatorChain<
  Prs extends <U>(value: unknown, arg: U) => any,
  T extends Record<string, (arg: U, ...args: any) => any>,
  U extends ScalarParserSchema
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
  StringParserSchema,
  StringValidatorChain,
  ScalarParserSchema,
  ScalarValidatorChain,
}

export const v = validator
