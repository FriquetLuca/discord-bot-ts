import { assert } from "@/libraries/typeof"
import { type Parser } from "."

export function arrayValidator<S extends Parser>(schema: S) {
  function validate(arg: unknown): asserts arg is ReturnType<S["parse"]>[] {
    assert(arg, "array")
    for(let i = 0; i < arg.length; i++) {
      schema.parse(arg[i])
    }
  }
  return {
    parse(arg: unknown) {
      validate(arg)
      return arg
    }
  }
}
