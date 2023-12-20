import type { DeepReadonly } from "@/libraries/types"
/**
 * Make a mutable object fully immutable
 * @param object The supposedly mutable object
 * @returns A deeply immutable object
 */
export function deepImmutable<T extends object>(object: T): DeepReadonly<T> {
  for (const name in object) {
    const value = object[name];
    if ((value && typeof value === "object") || typeof value === "function") {
      deepImmutable(value);
    }
  }
  return Object.freeze(object);
}
