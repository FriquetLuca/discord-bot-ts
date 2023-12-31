import { fromFunction } from "./fromFunction"

/**
 * The raw value returned by a functor.
 */
export type RawResult<T, U extends Error = Error> = {
  success: true,
  value: T
} | {
  success: false,
  error: U
}

/**
 * The result returned by a functor.
 */
export type Result<Value, Err extends Error = Error> = {
  isError: boolean,
  /**
   * Get the value of the result without safety : if there was an error, it's going to be throwned.
   */
  get: () => Value
  /**
   * Get the value or a default value in case there's been an error somewhere.
   * @param otherwise The default value in case an error occured.
   */
  getOrElse: (otherwise: Value) => Value
  /**
   * Return any error that has been registered in the result.
   */
  getError: () => Err | undefined
  /**
   * Unwrap the result to get the raw result value.
   */
  unwrap: () => RawResult<Value, Err>
  /**
   * Get the value or undefined in case an error occured.
   */
  unfold: () => Value | undefined
  /**
   * Throw any error that has been encoutered, otherwise it returns a result.
   */
  throw: () => Result<Value, Err>
  /**
   * Apply a function on the value.
   * @param fn The function to apply.
   */
  bind: <NewValue, NewErr extends Error = Error>(fn: (arg: Value) => NewValue) => Result<NewValue, Err | NewErr>
  /**
   * Recover a value in case an error has occured on the value.
   * @param error The error handler to get a recovered value from.
   */
  recover: (error: (error: Err) => Value) => Result<Value, Err>
}

/**
 * Handle a RawResult from a functor
 */
export function fromResult<Value, Err extends Error = Error>(result: RawResult<Value, Err>): Result<Value, Err> {
  return {
    isError: !result.success,
    get: () => {
      if(result.success) {
        return result.value
      }
      throw result.error
    },
    getOrElse: (otherwise: Value) => {
      if(result.success) {
        return result.value
      }
      return otherwise
    },
    getError: () => !result.success ? result.error : undefined,
    unwrap: () => result,
    unfold: () => result.success ? result.value : undefined,
    throw: () => {
      if(!result.success) {
        throw result.error
      }
      return fromResult(result)
    },
    recover: (error: (error: Err) => Value) => {
      if(result.success) {
        return fromResult(result)
      }
      return fromResult({
        success: true,
        value: error(result.error)
      })
    },
    bind: <NewValue, NewErr extends Error = Error>(fn: (arg: Value) => NewValue) => fromResult<NewValue, Err | NewErr>(result.success ? fromFunction<(arg: Value) => NewValue, Err | NewErr>(fn).execute(result.value).unwrap() : result),
  }
}