import { getTypeof, type FromVanilla, type VanillaTypes } from "./getTypeof";
import { typeError } from "./typeError";

export function assert<T extends VanillaTypes>(val: unknown, ...typeNames: T[]): asserts val is FromVanilla<T> {
  if(!typeNames.includes(getTypeof(val) as any)) {
    throw typeError(val, typeNames.join(" | "))
  }
}
