import type { DeepMutable } from "@/libraries/types"
/**
 * Make an immutable object fully mutable
 * @param immutableData The supposedly immutable object
 * @returns A deeply mutable object
 */
export function deepMutable<T extends object>(immutableData: T): DeepMutable<T> {
  const result: Partial<DeepMutable<T>> = {}
  for (const name in immutableData) {
    const value = immutableData[name];
    if ((value && typeof value === "object") || typeof value === "function") {
      result[name] = deepMutable(value);
    } else {
      result[name] = value
    }
  }
  return result as DeepMutable<T>
}
