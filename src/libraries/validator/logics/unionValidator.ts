import type { Collapse } from "@/libraries/types";
import type { ElementShape } from "../schema";

const parseOr = <T extends ElementShape, U extends ElementShape>(value: unknown, lhs: T, rhs: U): ReturnType<T["parse"]> | ReturnType<U["parse"]> => {
  const lhsSchema = lhs.getSchema()
  const rhsSchema = rhs.getSchema()
  const undefinable = lhsSchema.data.undefinable || rhsSchema.data.undefinable
  const nullable = lhsSchema.data.nullable || rhsSchema.data.nullable
  if(undefinable === true && value === undefined) {
    return value as any
  }
  if(nullable === true && value === null) {
    return value as any
  }
  const errors: string[] = []
  try {
    lhs.parse(value)
  } catch(e) {
    errors.push((e as Error).message)
  }
  try {
    rhs.parse(value)
  } catch(e) {
    errors.push((e as Error).message)
  }
  if(errors.length === 2) {
    for(const err of errors) {
      throw new Error(err)
    }
  }
  return value as any
}

export type UnionValidator<T extends ElementShape, U extends ElementShape, Rest = {}> = {
  parse: (value: unknown) => Rest | ReturnType<T["parse"]> | ReturnType<U["parse"]>
  union: <W extends ElementShape>(or: W) => UnionValidator<{
    parse: (value: unknown) => Rest | ReturnType<T["parse"]> | ReturnType<U["parse"]>
    getSchema: () => ({})
  }, W>
}

export const unionValidator = <T extends ElementShape, U extends ElementShape>(lhs: T, rhs: U): UnionValidator<T, U> => {
  const parse = (value: unknown) => parseOr(value, lhs, rhs)
  return {
    parse,
    union: <W extends ElementShape>(or: W) => unionValidator({
      parse,
      getSchema: () => ({})
    }, or),
  }
}
