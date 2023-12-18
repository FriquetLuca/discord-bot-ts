type RecordType = Record<string|number|symbol, any>

/**
 * A records handler for a functional programming handling of an array of records
 */
type Records<T extends RecordType> = {
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
  leftJoin: <U extends RecordType>(otherRecords: U[], on: keyof T & keyof U) => Records<T & Partial<U>>
  /**
   * Returns all the rows from the right list of records and the matched rows from the left list of records.
   * @param otherRecords The list of records to join
   * @param on The field to join the list of records on
   * @returns All the rows from the right list of records and the matched rows from the left list of records
   */
  rightJoin: <U extends RecordType>(otherRecords: U[], on: keyof T & keyof U) => Records<Partial<T> & U>
  /**
   * Returns only the rows where there is a match in both tables based on the specified condition.
   * @param otherRecords The list of records to join
   * @param on The field to join the list of records on
   * @returns Only the rows where there is a match in both tables based on the specified condition
   */
  innerJoin: <U extends RecordType>(otherRecords: U[], on: keyof T & keyof U) => Records<T & U>
  /**
   * Returns all rows when there is a match in either the left or right list of records.
   * @param otherRecords The list of records to join
   * @param on The field to join the list of records on
   * @returns All rows when there is a match in either the left or right list of records
   */
  fullJoin: <U extends RecordType>(otherRecords: U[], on: keyof T & keyof U) => Records<Partial<T> & Partial<U>>
  /**
   * Returns the Cartesian product of both list of records, i.e., all possible combinations of rows from the two list of records. It does not require a specific condition.
   * @param otherRecords The list of records to join
   * @returns The Cartesian product of both list of records
   */
  crossJoin: <U extends RecordType>(otherRecords: U[]) => Records<T & U>
  /**
   * Filter records based on a predicate.
   * @param predicate The predicate to filter the records
   * @returns The records filtered based on the predicate
   */
  filter: (predicate: (record: T) => boolean) => Records<Partial<T>>
  /**
   * Sort the records based on a compare function.
   * @param compareFn The function to compare two values
   * @returns The sorted records
   */
  sort: (compareFn?: ((a: T, b: T) => number) | undefined) => Records<T>
}
// select
// group by
// query
// left outer join
// right outer join
// union
// intersection
/**
 * Create a handler for a list of records
 * @param records An array representing a list of records
 * @returns The handler for the list of records
 */
export function fromRecords<T extends RecordType>(records: T[]): Records<T> {
  return {
    get: () => records,
    leftJoin: <U extends RecordType>(otherRecords: U[], on: keyof T & keyof U) => fromRecords(records.reduce((result, row1) => {
      const matchingRows = otherRecords
        .filter((row2) => row1[on] as any === row2[on])
        .map((row2) => ({ ...row1, ...row2 }));
      const unmatchedRow = { ...row1 } as T & Partial<U>;
      return result.concat(matchingRows.length > 0 ? matchingRows : [unmatchedRow]);
    }, [] as Array<T & Partial<U>>)) as unknown as Records<T & Partial<U>>,
    rightJoin: <U extends RecordType>(otherRecords: U[], on: keyof T & keyof U) => fromRecords(otherRecords).leftJoin(records, on),
    innerJoin: <U extends RecordType>(otherRecords: U[], on: keyof T & keyof U) => fromRecords(records.reduce((result, row1) => {
      const matchingRows = otherRecords
        .filter((row2) => row1[on] as any === row2[on])
        .map((row2) => ({ ...row1, ...row2 }));
      return result.concat(matchingRows);
    }, [] as Array<T & U>)) as unknown as Records<T & U>,
    fullJoin: <U extends RecordType>(otherRecords: U[], on: keyof T & keyof U) => {
      const leftResult = fromRecords(records).leftJoin(otherRecords, on).get();
      const rightResult = fromRecords(otherRecords).leftJoin(records, on).get();
      return fromRecords(leftResult.concat(rightResult.filter((row) => !leftResult.some((r) => r[on as any] as any === row[on as any])))) as unknown as Records<Partial<T> & Partial<U>>
    },
    crossJoin: <U extends RecordType>(otherRecords: U[]) => fromRecords(records.reduce((result, row1) => {
      const crossJoinedRows = otherRecords.map((row2) => ({ ...row1, ...row2 }));
      return result.concat(crossJoinedRows);
    }, [] as Array<T & U>)) as unknown as Records<T & U>,
    filter: (predicate: (record: T, index: number, array: T[]) => boolean) => fromRecords(records.filter(predicate)),
    sort: (compareFn?: ((a: T, b: T) => number) | undefined) => fromRecords(records.sort(compareFn)) as unknown as Records<T>
  }
}
