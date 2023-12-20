import type { DeepMerge, DeepMutable, DeepReadonly, Mutable } from "@/libraries/types"
import { deepImmutable, deepMerge, deepMutable } from "../objects"

type NewKeyName<T extends Record<string | number | symbol, any>, U extends { key: keyof T, as?: string }> = U["as"] extends string ? U["as"] : U["key"]
export type TransformKeys<T extends Record<string | number | symbol, any>, U extends { key: keyof T, as?: string }> = { [K in keyof T as NewKeyName<T, U & { key: K, as?: string }>]: T[K] }
type LiteralUnion<T extends U, U = string> = T | (U & {})
/**
 * A record handler for a functional programming handling of a record
 */
export type RecordObject<T extends Record<string|number|symbol, any>> = {
  /**
   * Get the current record
   * @returns The current record
   */
  get: () => { [K in keyof T]: T[K] }
  /**
   * Get all the keys from the record
   * @returns All the keys from the record
   */
  getKeys: () => (keyof T)[]
  /**
   * Find a field from a record, otherwise it return undefined
   * @param item The field to find
   * @returns The value of the field, undefined otherwise
   */
  find: <U extends LiteralUnion<keyof T, string|number|symbol>>(item: U) => U extends keyof T ? T[U] : undefined
  /**
   * Remove fields from a record
   * @param items All the fields to remove from the record
   * @returns All the leftover fields in a new ObjectRecord
   */
  omit: <U extends keyof T>(...items: U[]) => RecordObject<Omit<T, U>>
  /**
   * Pick a part of the record from it's fields
   * @param items All the fields to pick from the record
   * @returns All the picked fields in a new ObjectRecord
   */
  pick: <U extends keyof T>(...items: U[]) => RecordObject<Pick<T, U>>
  /**
   * Check if the record has all fields with the specific values
   * @param items The key / value of every fields
   * @returns True if all fields have the specified value
   */
  every: <U extends keyof T>(...items: {key: U, value: T[keyof T]}[]) => boolean
  /**
   * Check if the record has some fields with a specific value
   * @param items The key / value of every fields
   * @returns True if at least one field have the specified value
   */
  some: <U extends keyof T>(...items: {key: U, value: T[keyof T]}[]) => boolean
  /**
   * Check if the record has not all fields without the specified values
   * @param items The key / value of every fields
   * @returns True if the record has not all fields without the specified values
   */
  none: <U extends keyof T>(...items: {key: U, value: T[keyof T]}[]) => boolean
  /**
   * Check if the record has not least one field without the specified values
   * @param items The key / value of every fields
   * @returns True if the record has not least one field without the specified values
   */
  maybeNot: <U extends keyof T>(...items: {key: U, value: T[keyof T]}[]) => boolean
  /**
   * Check if the records has an even number of fields true
   * @param items The key / value of every fields
   * @returns True if the records has an even number of fields true
   */
  hasEven: <U extends keyof T>(...items: {key: U, value: T[keyof T]}[]) => boolean
  /**
   * Check if the records has an odd number of fields true
   * @param items The key / value of every fields
   * @returns True if the records has an odd number of fields true
   */
  hasOdd: <U extends keyof T>(...items: {key: U, value: T[keyof T]}[]) => boolean
  /**
   * Map a record's fields into an array
   * @param mapper The mapper for every key / value of the current record
   * @returns An array containing the map of the record's fields
   */
  map: <V>(mapper: (key: keyof T, value: T[keyof T], record: T) => V) => V[]
  /**
   * Filter the fields of a record
   * @param predicate The filter to apply to all fields
   * @returns The filtered record's ObjectRecord's representation
   */
  filter: (predicate: (key: keyof T, value: T[keyof T], record: T) => boolean) => RecordObject<Partial<T>>
  /**
   * Insert a new field in the record with an associated value
   * @param propertyName The field's name
   * @param value The fields's value
   * @returns The ObjectRecord's representation of the record with the inserted field
   */
  insert: <U extends string|number|symbol, V>(propertyName: U, value: V) => RecordObject<T & { [K in U]: V }>
  /**
   * Change a record into another type of record
   * @param into The function to transform the record into another type of record
   * @returns The ObjectRecord that has been morphed
   */
  into: <V extends Record<string|number|symbol, any>>(into: (record: T) => V) => RecordObject<V>
  /**
   * Change the type of a record into anything
   * @param transform A function to change the type of the record
   * @returns The value the record has been changed into
   */
  transform: <V>(transform: (record: T) => V) => V
  /**
   * Merge the current record into a record
   * @param item A record in which the current record will be merged into
   * @returns The merged records into an ObjectRecord
   */
  leftMerge: <U extends Record<string|number|symbol, any>>(item: U) => RecordObject<{ [K in (keyof T | keyof U)]: K extends keyof T ? T[K] : U[K] }>
  /**
   * Merge a record into the current record
   * @param item A record that will be merged into the current record
   * @returns The merged records into an ObjectRecord
   */
  rightMerge: <U extends Record<string|number|symbol, any>>(item: U) => RecordObject<{ [K in (keyof T | keyof U)]: K extends keyof U ? U[K] : T[K] }>
  /**
   * Intersect the current record with another record, picking only shared fields between records but keeping only the current record values.
   * @param item The record to intersect with
   * @returns A record object with only shared fields between records and containing the current record values.
   */
  intersect: <U extends Record<string | number | symbol, any>>(item: U) => RecordObject<Pick<T, keyof T & keyof U>>
  /**
   * Get all different fields between two records inside a new record.
   * @param item The other records to get fields from
   * @returns The difference between fields of two records inside a new record
   */
  difference: <U extends Record<string | number | symbol, any>>(item: U) => RecordObject<Omit<T, keyof T & keyof U> & Omit<U, keyof T & keyof U>>
  /**
   * Apply a function on every fields of a record
   * @param apply The function to apply to all fields
   * @returns The ObjectRecord of the record with the apply applied on all the fields
   */
  apply: (apply: (key: keyof T, value: T[keyof T], record: T) => T[keyof T]) => RecordObject<T>
  /**
   * Apply a function on a specific field on the record
   * @param apply The function to apply on the field
   * @returns The ObjectRecord with the field that has been changed
   */
  applyOn: <U extends keyof T>(key: U, apply: (value: T[U]) => T[U]) => RecordObject<T>
  /**
   * Change the field value into another value
   * @param key The field name to change
   * @param into The function to apply to change the value into another one
   * @returns The ObjectRecord with the field that has been changed into another type
   */
  intoOn: <U extends keyof T, V>(key: U, into: (value: T[U]) => V) => RecordObject<{ [K in (keyof T | U)]: K extends U ? V : T[K] }>
  /**
   * Freeze the entire record, making it readonly.
   * @returns The readonly record in a RecordObject
   */
  freeze: () => RecordObject<Readonly<T>>
  /**
   * Check if the record is readonly and return true if it is.
   * @returns True if the record is frozen
   */
  isFrozen: () => boolean
  /**
   * Seal an object, making it impossible to add or remove fields from the record.
   * @returns The sealed record in a RecordObject
   */
  seal: () => RecordObject<T>
  /**
   * Set the selected fields as readonly.
   * @param items The keys of the fields to freeze
   * @returns The record with the selected fields marked as readonly
   */
  freezeKeys: <U extends keyof T>(...items: U[]) => RecordObject<Omit<T, U> & Readonly<{ [K in U]: T[K]; }>>
  /**
   * Return true if all the selected fields are readonly.
   * @param keys The keys of the fields to check if they're marked as readonly
   * @returns True if all the selected fields are readonly
   */
  areKeysFrozen: (...keys: (keyof T)[]) => boolean
  /**
   * Unfreeze the object, making it mutable.
   */
  unfreeze: () => RecordObject<Mutable<T>>
  /**
   * Freeze completely the object and it's nested values.
   */
  deepFreeze: () => RecordObject<DeepReadonly<T>>
  /**
   * Unfreeze completely the object and it's nested values.
   */
  deepUnfreeze: () => RecordObject<DeepMutable<T>>
  /**
   * Merge two records into a single one, merging also the childs of the records.
   * @param item The record to deep merge with
   */
  deepMerge: <U extends Record<string|number|symbol, any>>(item: U) => RecordObject<DeepMerge<[T, U]>>
  select: <U extends keyof T, V extends string, W extends {
    key: U;
    as?: V | undefined;
  }>(...items: W[]) => RecordObject<TransformKeys<T, W>>
}
/**
 * Create a handler for a record
 * @param record The record to handle
 * @returns An ObjectRecord to handle the record
 */
export function fromRecord<T extends Record<string|number|symbol, any>>(record: T): RecordObject<T> {
  return {
    get: () => record as { [K in keyof T]: T[K] },
    deepMerge: <U extends Record<string|number|symbol, any>>(item: U) => fromRecord(deepMerge(record, item)),
    getKeys: () => Object.entries(record).map(([key, _]) => key) as (keyof T)[],
    find: <U extends LiteralUnion<keyof T, string|number|symbol>>(item: U) => record[item as unknown as keyof T],
    freeze: () => fromRecord(Object.freeze(record)),
    deepFreeze: () => fromRecord(deepImmutable(record)),
    unfreeze: () => fromRecord({ ...record }),
    deepUnfreeze: () => fromRecord(deepMutable(record)),
    freezeKeys: <U extends keyof T>(...items: U[]) => {
      const result = { ...record } as any
      for(const item of items) {
        result[item] = Object.freeze(result[item])
      }
      return fromRecord(result as Omit<T, U> & Readonly<{ [K in U]: T[K] }>)
    },
    isFrozen: () => Object.isFrozen(record),
    seal: () => fromRecord(Object.seal(record)),
    omit: <U extends keyof T>(...items: U[]) => {
      const result = {} as any
      for(const item in record) {
        if(!items.includes(item as unknown as U)) {
          result[item] = record[item]
        }
      }
      return fromRecord(result as Omit<T, U>)
    },
    pick: <U extends keyof T>(...items: U[]) => {
      const result = {} as any
      for(const item in record) {
        if(items.includes(item as unknown as U)) {
          result[item] = record[item]
        }
      }
      return fromRecord(result as Pick<T, U>)
    },
    select: <U extends keyof T, V extends string, W extends { key: U, as?: V }>(...items: W[]) => {
      const result = {} as any
      const recordKeys = fromRecord(record).getKeys()
      for(const item of items) {
        if(recordKeys.includes(item.key)) {
          result[item.as ?? item.key] = record[item.key]
        }
      }
      return fromRecord(result) as RecordObject<TransformKeys<T, W>>
    },
    every: <U extends keyof T>(...items: {key: U, value: T[keyof T]}[]) => items.reduce((prev, curr) => prev && (record[curr.key] === curr.value), true),
    some: <U extends keyof T>(...items: {key: U, value: T[keyof T]}[]) => items.reduce((prev, curr) => prev || (record[curr.key] === curr.value), false),
    hasEven: <U extends keyof T>(...items: {key: U, value: T[keyof T]}[]) => items.reduce((prev, curr) => prev !== (record[curr.key] === curr.value), true),
    hasOdd: <U extends keyof T>(...items: {key: U, value: T[keyof T]}[]) => items.reduce((prev, curr) => prev !== (record[curr.key] === curr.value), false),
    none: <U extends keyof T>(...items: {key: U, value: T[keyof T]}[]) => items.reduce((prev, curr) => prev && (record[curr.key] !== curr.value), true),
    maybeNot: <U extends keyof T>(...items: {key: U, value: T[keyof T]}[]) => items.reduce((prev, curr) => prev || (record[curr.key] !== curr.value), false),
    map: <V>(mapper: (key: keyof T, value: T[keyof T], record: T) => V) => {
      const result: V[] = []
      for(const key in record) {
        result.push(mapper(key, record[key], record))
      }
      return result
    },
    insert: <U extends string|number|symbol, V>(propertyName: U, value: V) => {
      const o = { ...record } as any
      o[propertyName] = value;
      return fromRecord(o as T & { [K in U]: V })
    },
    into: <V extends Record<string|number|symbol, any>>(into: (record: T) => V) => fromRecord(into(record)),
    intoOn: <U extends keyof T, V>(key: U, into: (value: T[U]) => V) => {
      const result = { ...record } as any
      result[key] = into(result[key])
      return fromRecord(result as { [K in (keyof T | U)]: K extends U ? V : T[K] })
    },
    transform: <V>(transform: (record: T) => V) => transform(record),
    filter: (predicate: (key: keyof T, value: T[keyof T], record: T) => boolean) => {
      const result = {} as Partial<T>
      for(const key in record) {
        if(predicate(key, record[key], record)) {
          result[key] = record[key]
        }
      }
      return fromRecord(result)
    },
    apply: (apply: (key: keyof T, value: T[keyof T], record: T) => T[keyof T]) => {
      const result = {} as T
      for(const key in record) {
        result[key] = apply(key, record[key], record) as T[Extract<keyof T, string>]
      }
      return fromRecord(result)
    },
    applyOn: <U extends keyof T>(key: U, applyOn: (value: T[U]) => T[U]) => {
      const result = { ...record } as T
      result[key] = applyOn(result[key])
      return fromRecord(result)
    },
    leftMerge: <U extends Record<string|number|symbol, any>>(item: U) => fromRecord({ ...item, ...record }),
    rightMerge: <U extends Record<string|number|symbol, any>>(item: U) => fromRecord({ ...record, ...item }),
    intersect: <U extends Record<string|number|symbol, any>>(item: U) => {
      const set = new Set<keyof T & keyof U>()
      const firstRecord = fromRecord(record)
      const secondRecord = fromRecord(item)
      firstRecord.getKeys().forEach(key => {
        if(secondRecord.getKeys().includes(key)) {
          set.add(key)
        }
      })
      return fromRecord(record).pick(...Array.from(set.keys()))
    },
    difference: <U extends Record<string|number|symbol, any>>(item: U) => {
      const recordKeys = Object.keys(record)
      const itemKeys = Object.keys(item)
      const uniqueKeys = new Set([ ...recordKeys, ...itemKeys ])
      const difference = {} as any
      for (const key of uniqueKeys) {
        if(item[key as any] !== undefined && !recordKeys.includes(key as string)) {
          difference[key] = item[key] as Omit<T, keyof T & keyof U> & Omit<U, keyof T & keyof U>
        } else if(record[key as any] !== undefined && !itemKeys.includes(key as string)) {
          difference[key] = record[key] as Omit<T, keyof T & keyof U> & Omit<U, keyof T & keyof U>
        }
      }
      return fromRecord(difference)
    },
    areKeysFrozen: (...keys: (keyof T)[]) => keys.reduce((prev, curr) => prev && Object.isFrozen(record[curr]), true),
  }
}
