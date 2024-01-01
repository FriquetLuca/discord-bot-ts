import { type TransformKeys, fromRecord } from "./fromRecord"

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
   * Calls a defined callback function on each element of an array, and returns an array that contains the results.
   * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
   * @returns A RecordsObject that contains the results
   */
  transform: <U extends RecordType>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any) => RecordsObject<U>
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
  pick: <U extends keyof T>(...selection: U[]) => RecordsObject<Pick<T, U>>
  /**
   * Select keys from the records and rename them on the fly if needed.
   * @param items The selected fields and their alias if they need one
   * @returns The records with only the selected fields that may be renamed
   */
  select: <U extends keyof T, V extends string, W extends { key: U; as?: V | undefined }>(...items: W[]) => RecordsObject<{ [K in keyof TransformKeys<T, W>]: TransformKeys<T, W>[K]; }>
  /**
   * Remove the fields of every records
   * @param omits The fields to remove
   * @returns The records with the leftover fields
   */
  omit: <U extends keyof T>(...omits: U[]) => RecordsObject<{ [K in keyof Omit<T, U>]: Omit<T, U>[K] }>
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
  reduce: (callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initialValue: T) => T
  /**
   * Reduce records into a single value starting at the back of the array.
   * @param callbackfn The callback that's going to be applied on every records to reduce the value into a single value
   * @param initialValue The initial value to assign on the reduce
   * @returns The value all records has been turned into
   */
  reduceRight: (callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initialValue: T) => T
  /**
   * Determines whether the specified callback function returns true for any element of the records.
   * @param predicate A function that accepts up to three arguments. The some method calls the predicate function for each record in the records until the predicate returns a value which is coercible to the Boolean value true, or until the end of the records.
   * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
   */
  some: (predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: any) => boolean
  /**
   * Determines whether all the members of the records satisfy the specified test.
   * @param predicate A function that accepts up to three arguments. The every method calls the predicate function for each record in the records until the predicate returns a value which is coercible to the Boolean value false, or until the end of the records.
   * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
   */
  every: (predicate: (value: T, index: number, array: T[]) => boolean, thisArg?: any) => boolean
  /**
   * Changes all record elements from start to end index to a static value and returns the modified records
   * @param value — value to fill record section with
   * @param start index to start filling the record at. If start is negative, it is treated as count+start where count is the count of the records.
   * @param end index to stop filling the record at. If end is negative, it is treated as count+end.
   */
  fill: (value: T, start?: number | undefined, end?: number | undefined) => RecordsObject<T>
  /**
   * Combines two or more records. This method returns a new records.
   * @param items — Additional records and/or records to add to the end of the records.
   */
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
  /**
   * Sort the elements in the records by keys as groups so if a key is already sorted, it's going to use the next one to sort the records until it has finished.
   * @param keys The keys to sort and if it should be sorted in desc manner or not
   */
  orderBy: <U extends keyof T>(...keys: ({ key: U, desc?: boolean })[]) => RecordsObject<T>
  /**
   * Returns the value of the first element in the array where predicate is true, and undefined otherwise.
   * @param predicate find calls predicate once for each element of the array, in ascending order, until it finds one where predicate returns true. If such an element is found, find immediately returns that element value. Otherwise, find returns undefined.
   * @param thisArg If provided, it will be used as the this value for each invocation of predicate. If it is not provided, undefined is used instead.
   */
  findFirst: (predicate: (value: T, index: number, obj: T[]) => value is T, thisArg?: any) => T | undefined
  /**
   * Returns the value of the last element in the array where predicate is true, and undefined otherwise.
   * @param predicate findLast calls predicate once for each element of the array, in descending order, until it finds one where predicate returns true. If such an element is found, findLast immediately returns that element value. Otherwise, findLast returns undefined.
   * @param thisArg If provided, it will be used as the this value for each invocation of predicate. If it is not provided, undefined is used instead.
   */
  findLast: (predicate: (value: T, index: number, obj: T[]) => value is T, thisArg?: any) => T | undefined
  /**
   * Returns the index of the first element in the array where predicate is true, and -1 otherwise.
   * @param predicate find calls predicate once for each element of the array, in ascending order, until it finds one where predicate returns true. If such an element is found, findIndex immediately returns that element index. Otherwise, findIndex returns -1.
   * @param thisArg If provided, it will be used as the this value for each invocation of predicate. If it is not provided, undefined is used instead.
   */
  findFirstIndex: (predicate: (value: T, index: number, obj: T[]) => value is T, thisArg?: any) => number
  /**
   * Returns the index of the last element in the array where predicate is true, and -1 otherwise.
   * @param predicate findLastIndex calls predicate once for each element of the array, in descending order, until it finds one where predicate returns true. If such an element is found, findLastIndex immediately returns that element index. Otherwise, findLastIndex returns -1.
   * @param thisArg If provided, it will be used as the this value for each invocation of predicate. If it is not provided, undefined is used instead.
   */
  findLastIndex: (predicate: (value: T, index: number, obj: T[]) => value is T, thisArg?: any) => number
  /**
   * Removes the first element from an array and returns it. If the array is empty, undefined is returned and the array is not modified.
   */
  takeFirst: () => T | undefined
  /**
   * Removes the last element from an array and returns it. If the array is empty, undefined is returned and the array is not modified.
   */
  takeLast: () => T | undefined
  /**
   * Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.
   * @param start — The zero-based location in the array from which to start removing elements.
   * @param deleteCount — The number of elements to remove.
   * @returns — An array containing the elements that were deleted.
   */
  removeAt: (start: number, deleteCount?: number | undefined) => RecordsObject<T>
  /**
   * Reduce records into a single value, in contrast to reduce, this actually doesn't force the initial value to be of the same type.
   * @param callbackfn The callback that's going to be applied on every records to reduce the value into a single value
   * @param initialValue The initial value to assign on the reduce
   * @returns The value all records has been turned into
   */
  aggregate: <U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U) => U,
  /**
   * Execute a query on the records.
   * @param query The query to execute on the records
   */
  query: <
      SelectKeys extends keyof T,
      OrderByKeys extends SelectKeys,
      SelectAliases extends string,
      Select extends { key: SelectKeys; as?: SelectAliases },
      Where extends (record: TransformKeys<T, Select>, index: number, array: T[]) => boolean,
    >(query: {
      select: Select[],
      where: Where,
      orderBy?: ({ key: OrderByKeys, desc?: boolean })[],
      limit?: number,
      offset?: number,
    }) => RecordsObject<{ [K in keyof TransformKeys<T, Select>]: TransformKeys<T, Select>[K]; }>
}
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
    slice: (offset, limit) => fromRecords(records.slice(offset, offset + limit)),
    map: (callbackfn: (value: T, index: number, array: T[]) => T, thisArg?: any) => fromRecords(records.map(callbackfn, thisArg)),
    transform: <U extends RecordType>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any) => fromRecords(records.map(callbackfn, thisArg)),
    union: <U extends RecordType>(unionRecords: U[]) => fromRecords([ ...records, ...unionRecords ]),
    pick: <U extends keyof T>(...selection: U[]) => fromRecords(records.map((record) => fromRecord(record).pick(...selection).get())),
    select: <U extends keyof T, V extends string, W extends {
      key: U;
      as?: V | undefined;
    }>(...items: W[]) => fromRecords(records.map((record) => fromRecord(record).select(...items).get())),
    omit: <U extends keyof T>(...omits: U[]) => fromRecords(records.map((record) => fromRecord(record).omit(...omits).get())),
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
    reduce: (callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initialValue?: T) => initialValue ? records.reduce(callbackfn, initialValue) : records.reduce(callbackfn),
    reduceRight: (callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initialValue?: T) => initialValue ? records.reduceRight(callbackfn, initialValue) : records.reduceRight(callbackfn),
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
    findFirst: (predicate: (value: T, index: number, obj: T[]) => value is T, thisArg?: any) => records.find(predicate, thisArg),
    findLast: (predicate: (value: T, index: number, obj: T[]) => value is T, thisArg?: any) => records.findLast(predicate, thisArg),
    findFirstIndex: (predicate: (value: T, index: number, obj: T[]) => value is T, thisArg?: any) => records.findIndex(predicate, thisArg),
    findLastIndex: (predicate: (value: T, index: number, obj: T[]) => value is T, thisArg?: any) => records.findLastIndex(predicate, thisArg),
    takeFirst: () => records.shift(),
    takeLast: () => records.pop(),
    removeAt: (start: number, deleteCount?: number | undefined) => fromRecords(records.splice(start, deleteCount)),
    aggregate: <U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U) => {
      let r = initialValue
      for(let i = 0; i < records.length; i++) {
        r = callbackfn(r, records[i], i, records)
      }
      return r
    },
    query: <
      SelectKeys extends keyof T,
      OrderByKeys extends SelectKeys,
      SelectAliases extends string,
      Select extends { key: SelectKeys; as?: SelectAliases },
      Where extends (record: TransformKeys<T, Select>, index: number, array: T[]) => boolean,
    >(query: {
      select: Select[],
      where?: Where,
      orderBy?: ({ key: OrderByKeys, desc?: boolean })[],
      limit?: number,
      offset?: number,
    }) => {
      let result: any[] = []
      for(let i = 0; i < records.length; i++) {
        const currentRecord = fromRecord(records[i])
          .select(...query.select)
          .get()
        if(query.where) {
          if(query.where(currentRecord as TransformKeys<T, Select>, i, records)) {
            result.push(currentRecord)
          }
        } else {
          result.push(currentRecord)
        }
      }
      if(query.orderBy) {
        result = result.sort((a, b) => {
          for (const key in query.orderBy) {
            const cKey = query.orderBy[key as any]
            const aValue = a[cKey.key]
            const bValue = b[cKey.key]
            if (aValue < bValue) {
              return cKey.desc === true ? 1 : -1
            } else if (aValue > bValue) {
              return cKey.desc === true ? -1 : 1
            }
          }
          return 0
        })
      }
      return fromRecords(result.slice(query.offset, query.limit ? (query.offset ?? 0) + query.limit : undefined))
    },
  }
}
