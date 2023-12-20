import type { Result } from "@/libraries/types"
import { execute } from "./execute"

/**
 * Execute safely a result or pass an error
 * @param fn The function to execute
 * @param data The data to handle
 * @returns The altered data if it wasn't an error
 */
export function safeExecute<T, U, V extends Error>(fn: (arg: T) => U, data: Result<T, V>) {
  return data.success ? execute(fn, data.value) : data
}