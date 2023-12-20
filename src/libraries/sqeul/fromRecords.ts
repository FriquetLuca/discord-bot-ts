import { fromRecord } from "./fromRecord"

type RecordType = Record<string|number|symbol, any>

type If<T, Extends, Then, Otherwise> = T extends Extends ? Then : Otherwise

type ValidSQLScalar<Value, As> = If<
  Value, number,
  As,
  If<
    Value, string,
    As,
    If<
      Value, Date,
      As,
      If<
        Value, bigint,
        As, never
      >
    >
  >
>
type KeyCompatibleRecordKeys<T extends RecordType> = { [K in keyof T]: T[K] extends string ? T[K] : T[K] extends number ? T[K] : T[K] extends symbol ? T[K] : never }
type SQLScalars<T extends RecordType> = { [K in keyof T]: ValidSQLScalar<T[K], T[K]> }

/**
 * A records handler for a functional programming handling of an array of records
 */
export type RecordsObject<T extends RecordType> = {
  /**
   * Get the current list of records
   * @returns The current list of records
   */
  get: () => T[]
  /**
   * Returns all the rows from the left list of records and the matched rows from the right list of records.
   * @param otherRecords The list of records to join
   * @param on The field to join the list of records on
   * @returns All the rows from the left list of records and the matched rows from the right list of records
   */
  leftJoin: <U extends RecordType>(otherRecords: U[], ...on: (keyof T & keyof U)[]) => RecordsObject<T & Partial<U>>
  /**
   * Returns all the rows from the right list of records and the matched rows from the left list of records.
   * @param otherRecords The list of records to join
   * @param on The field to join the list of records on
   * @returns All the rows from the right list of records and the matched rows from the left list of records
   */
  rightJoin: <U extends RecordType>(otherRecords: U[], ...on: (keyof T & keyof U)[]) => RecordsObject<Partial<T> & U>
  /**
   * Returns only the rows where there is a match in both tables based on the specified condition.
   * @param otherRecords The list of records to join
   * @param on The field to join the list of records on
   * @returns Only the rows where there is a match in both tables based on the specified condition
   */
  innerJoin: <U extends RecordType>(otherRecords: U[], ...on: (keyof T & keyof U)[]) => RecordsObject<T & U>
  /**
   * Returns all rows when there is a match in either the left or right list of records.
   * @param otherRecords The list of records to join
   * @param on The field to join the list of records on
   * @returns All rows when there is a match in either the left or right list of records
   */
  fullJoin: <U extends RecordType>(otherRecords: U[], ...on: (keyof T & keyof U)[]) => RecordsObject<Partial<T> & Partial<U>>
  /**
   * Returns the Cartesian product of both list of records, i.e., all possible combinations of rows from the two list of records. It does not require a specific condition.
   * @param otherRecords The list of records to join
   * @returns The Cartesian product of both list of records
   */
  crossJoin: <U extends RecordType>(otherRecords: U[]) => RecordsObject<T & U>
  /**
   * Filter records based on a predicate.
   * @param predicate The predicate to filter the records
   * @returns The records filtered based on the predicate
   */
  filter: (predicate: (record: T, index: number, array: T[]) => boolean) => RecordsObject<T>
  /**
   * Sort the records based on a compare function.
   * @param compareFn The function to compare two values
   * @returns The sorted records
   */
  sort: (compareFn?: ((a: T, b: T) => number) | undefined) => RecordsObject<T>
  /**
   * Get the current count of records
   * @returns The current count of records
   */
  count: () => number
  /**
   * Start taking the element from the offset position.
   * @param offset The position to start taking element from
   * @returns The records starting at the offset position
   */
  offset: (offset: number) => RecordsObject<T>
  /**
   * Limit the maximum amount of elements to keep in the records.
   * @param limit The maximum amount of elements to keep
   * @returns The maximum amount of elements to keep in the records
   */
  limit: (limit: number) => RecordsObject<T>
  /**
   * Get a portion of the records.
   * @param offset The offset to apply on the slice of the records
   * @param limit The limit of items to keep in the records starting at the offset
   * @returns A portion of the records
   */
  slice: (offset: number, limit: number) => RecordsObject<T>
  /**
   * Calls a defined callback function on each element of an array, and returns an array that contains the results.
   * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   * @returns A RecordsObject that contains the results
   */
  map: (callbackfn: (value: T, index: number, array: T[]) => T, thisArg?: any) => RecordsObject<T>
  /**
   * Create an union of both records
   * @param unionRecords The records to union with
   * @returns A RecordsObject containing the union of both records
   */
  union: <U extends RecordType>(unionRecords: U[]) => RecordsObject<T | U>
  /**
   * Select the fields of every records
   * @param selection The selected fields
   * @returns The records with only the selected fields
   */
  select: <U extends keyof T>(...selection: U[]) => RecordsObject<Pick<T, U>>
  /**
   * Remove the fields of every records
   * @param omits The fields to remove
   * @returns The records with the leftover fields
   */
  hide: <U extends keyof T>(...omits: U[]) => RecordsObject<{ [K in keyof Omit<T, U>]: Omit<T, U>[K] }>
  /**
   * Insert new records into the records.
   * @param newRecords The records to insert
   * @returns The records with the newly inserted records
   */
  insert: (...newRecords: T[]) => RecordsObject<T>
  /**
   * Execute a function for each record in the records.
   * @param callbackfn The function to execute on every records
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   */
  forEach: (callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any) => void
  /**
   * Group records by keys.
   * @param groupKeys The keys to group by
   * @returns Return grouped records by keys
   */
  groupBy: <U extends keyof T>(...groupKeys: U[]) => Record<U, { [K in keyof { [K in T[U]]: T[]; }]: { [K in T[U]]: T[]; }[K]; }[]>
  /**
   * Reduce records into a single value.
   * @param callbackfn The callback that's going to be applied on every records to reduce the value into a single value
   * @param initialValue The initial value to assign on the reduce
   * @returns The value all records has been turned into
   */
  reduce: <U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => T, initialValue: U) => U
  /**
   * Reduce records into a single value starting at the back of the array.
   * @param callbackfn The callback that's going to be applied on every records to reduce the value into a single value
   * @param initialValue The initial value to assign on the reduce
   * @returns The value all records has been turned into
   */
  reduceRight: <U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => T, initialValue: U) => U
  some: (predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: any) => boolean
  every: (predicate: (value: T, index: number, array: T[]) => boolean, thisArg?: any) => boolean
  fill: (value: T, start?: number | undefined, end?: number | undefined) => RecordsObject<T>
  concat: (...items: ConcatArray<T>[]) => RecordsObject<T>
  /**
   * Determines whether the records includes a certain element, returning true or false as appropriate.
   * @param searchElement — The element to search for.
   * @param fromIndex — The position in the records at which to begin searching for searchElement.
   */
  includes: (searchElement: T, fromIndex?: number | undefined) => boolean
  /**
   * Reverses the elements in an array in place. This method mutates the array and returns a reference to the same array.
   * @returns The reversed the elements in an array in place
   */
  reverse: () => RecordsObject<T>
  orderBy: <U extends keyof T>(...keys: ({ key: U, desc?: boolean })[]) => RecordsObject<T>
}
// query
// update - where
// delete - where
// where - like
// where - and
// where - or
// where - in
// where - between
// where - any
// where - all
// where - exist
/**
 * Create a handler for a list of records
 * @param records An array representing a list of records
 * @returns The handler for the list of records
 */
export function fromRecords<T extends RecordType>(records: T[]): RecordsObject<T> {
  return {
    get: () => records,
    leftJoin: <U extends RecordType>(otherRecords: U[], ...on: (keyof T & keyof U)[]) => fromRecords(records.reduce((result, row1) => {
      const matchingRows = otherRecords
        .filter((row2) => on.length === 0 ? false : on.reduce((p, v) => p && (row1[v] as any === row2[v]), true))
        .map((row2) => ({ ...row1, ...row2 }));
      const unmatchedRow = { ...row1 } as T & Partial<U>;
      return result.concat(matchingRows.length > 0 ? matchingRows : [unmatchedRow]);
    }, [] as Array<T & Partial<U>>)) as unknown as RecordsObject<T & Partial<U>>,
    rightJoin: <U extends RecordType>(otherRecords: U[], ...on: (keyof T & keyof U)[]) => fromRecords(otherRecords).leftJoin(records, ...on),
    innerJoin: <U extends RecordType>(otherRecords: U[], ...on: (keyof T & keyof U)[]) => fromRecords(records.reduce((result, row1) => {
      const matchingRows = otherRecords
        .filter((row2) => on.length === 0 ? false : on.reduce((p, v) => p && (row1[v] as any === row2[v]), true))
        .map((row2) => ({ ...row1, ...row2 }));
      return result.concat(matchingRows);
    }, [] as Array<T & U>)) as unknown as RecordsObject<T & U>,
    fullJoin: <U extends RecordType>(otherRecords: U[], ...on: (keyof T & keyof U)[]) => {
      const leftResult = fromRecords(records).leftJoin(otherRecords, ...on).get();
      const rightResult = fromRecords(otherRecords).rightJoin(records, ...on).get();
      const combinedResult = leftResult.map((leftRow) => {
        const matchingRightRow = rightResult.find((rightRow) =>
          on.length === 0 ? false : on.every((key) => leftRow[key] === rightRow[key])
        )
        return { ...leftRow, ...matchingRightRow }
      })
      const unmatchedRightRows = rightResult.filter((rightRow) =>
        !combinedResult.some((row) => on.length === 0 ? false : on.every((key) => row[key] === rightRow[key]))
      )
      return fromRecords(combinedResult.concat(unmatchedRightRows)) as unknown as RecordsObject<Partial<T> & Partial<U>>
    },
    crossJoin: <U extends RecordType>(otherRecords: U[]) => fromRecords(records.reduce((result, row1) => {
      const crossJoinedRows = otherRecords.map((row2) => ({ ...row1, ...row2 }));
      return result.concat(crossJoinedRows);
    }, [] as Array<T & U>)) as unknown as RecordsObject<T & U>,
    filter: (predicate: (record: T, index: number, array: T[]) => boolean) => fromRecords(records.filter(predicate)),
    sort: (compareFn?: ((a: T, b: T) => number) | undefined) => fromRecords(records.sort(compareFn)) as unknown as RecordsObject<T>,
    count: () => records.length,
    insert: (...newRecords: T[]) => fromRecords([ ...records, ...newRecords ]),
    forEach: (callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any) => records.forEach(callbackfn, thisArg),
    offset: (offset) => fromRecords(records.slice(offset)),
    limit: (limit) => fromRecords(records.slice(0, limit)),
    slice: (offset, limit) => fromRecords(records.slice(offset, limit)),
    map: (callbackfn: (value: T, index: number, array: T[]) => T, thisArg?: any) => fromRecords(records.map(callbackfn, thisArg)),
    union: <U extends RecordType>(unionRecords: U[]) => fromRecords({ ...records, ...unionRecords }),
    select: <U extends keyof T>(...selection: U[]) => fromRecords(records.map((record) => fromRecord(record).pick(...selection).get())),
    hide: <U extends keyof T>(...omits: U[]) => fromRecords(records.map((record) => fromRecord(record).omit(...omits).get())),
    groupBy: <U extends keyof KeyCompatibleRecordKeys<T>>(...groupKeys: U[]) => {
      const result = {} as Record<U, { [K in keyof { [K in T[U]]: T[]; }]: { [K in T[U]]: T[]; }[K]; }[]>
      groupKeys.forEach(groupKey => {
        const currentGroupResult = new Map<T[U], T[]>()
        records.forEach((record) => {
          const keyValue = record[groupKey];
  
          if (currentGroupResult.has(keyValue)) {
            currentGroupResult.get(keyValue)!.push(record);
          } else {
            currentGroupResult.set(keyValue, [record]);
          }
        })
        const resultToArray = Array.from(currentGroupResult.entries()).map(([key, value]) => fromRecord({}).insert(key, value).get())
        if(result[groupKey]) {
          result[groupKey]!.push(...resultToArray)
        } else {
          result[groupKey] = resultToArray
        }
      })
      return result
    },
    reduce: <U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => T, initialValue?: U) => initialValue ? records.reduce(callbackfn, initialValue) : records.reduce(callbackfn),
    reduceRight: <U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => T, initialValue?: U) => initialValue ? records.reduceRight(callbackfn, initialValue) : records.reduceRight(callbackfn),
    some: (predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: any) => records.some(predicate, thisArg),
    every: (predicate: (value: T, index: number, array: T[]) => boolean, thisArg?: any) => records.every(predicate, thisArg),
    fill: (value: T, start?: number | undefined, end?: number | undefined) => fromRecords(records.fill(value, start, end)),
    concat: (...items: ConcatArray<T>[]) => fromRecords(records.concat(...items)),
    includes: (searchElement: T, fromIndex?: number | undefined) => records.includes(searchElement, fromIndex),
    reverse: () => fromRecords(records.reverse()),
    orderBy: <U extends keyof SQLScalars<T>>(...keys: ({ key: U, desc?: boolean })[]) => fromRecords(records.sort((a, b) => {
      for (const key in keys) {
        const cKey = keys[key]
        const aValue = a[cKey.key]
        const bValue = b[cKey.key]
        if (aValue < bValue) {
          return cKey.desc === true ? 1 : -1
        } else if (aValue > bValue) {
          return cKey.desc === true ? -1 : 1
        }
      }
      return 0
    })),
  }
}
