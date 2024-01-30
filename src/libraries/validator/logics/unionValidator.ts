import type { ElementShape } from "../schema"

const parseOr = <T extends ElementShape, U extends ElementShape>(value: unknown, lhs: T, rhs: U): ReturnType<T["parse"]> | ReturnType<U["parse"]> => {
  const undefinable = (lhs as any)["undefinable"] || (rhs as any)["undefinable"]
  const nullable = (lhs as any)["nullable"] || (rhs as any)["nullable"]
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
    try {
      rhs.parse(value)
    } catch(e) {
      errors.push((e as Error).message)
    }
  }
  if(errors.length === 2) {
    throw new Error(errors.join(" | "))
  }
  return value as any
}

export type UnionValidator<T extends ElementShape, U extends ElementShape> = {
  parse: (value: unknown) => ReturnType<T["parse"]> | ReturnType<U["parse"]>
  union: <W extends ElementShape>(or: W) => UnionValidator<{
    parse: (value: unknown) => ReturnType<T["parse"]> | ReturnType<U["parse"]>
    getSchema: () => ({
      type: "union",
      data: {
        lhs: {
          parse: (value: unknown) => ReturnType<T["parse"]> | ReturnType<U["parse"]>,
          getSchema: () => ({
            type: "union",
            data: {
              lhs: T
              rhs: U,
            }
          })
        }
        rhs: W
      }
    })
  }, W>
}

export const unionValidatorConstructor = () => {}

export const unionValidator = <T extends ElementShape, U extends ElementShape>(lhs: T, rhs: U): UnionValidator<T, U> => {
  const parse = (value: unknown) => parseOr(value, lhs, rhs)
  return {
    parse,
    union: <W extends ElementShape>(or: W) => unionValidator({
      parse,
      getSchema: () => ({
        type: "union",
        data: {
          lhs: {
            parse,
            getSchema: () => ({
              type: "union",
              data: {
                lhs,
                rhs,
              }
            })
          },
          rhs: or
        },
      })
    }, or),
  }
}
