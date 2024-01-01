export const greater = <T extends bigint|string|number|Date>(lhs: T, rhs: T) => lhs > rhs
export const gEqual = <T extends bigint|string|number|Date>(lhs: T, rhs: T) => lhs >= rhs
export const less = <T extends bigint|string|number|Date>(lhs: T, rhs: T) => lhs < rhs
export const lEqual = <T extends bigint|string|number|Date>(lhs: T, rhs: T) => lhs <= rhs
export const between = <T extends bigint|string|number|Date>(value: T, minValue: T, maxValue: T) => value >= minValue && value <= maxValue
export const betweenExc = <T extends bigint|string|number|Date>(value: T, minValue: T, maxValue: T) => value > minValue && value < maxValue
export const min = <T extends bigint|string|number|Date>(lhs: T, rhs: T) => lhs > rhs ? rhs : lhs
export const max = <T extends bigint|string|number|Date>(lhs: T, rhs: T) => lhs > rhs ? lhs : rhs
