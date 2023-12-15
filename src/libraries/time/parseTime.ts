import { getTime } from "./getTime"

const all_patterns = [
  /^([0-5]?[0-9])'([0-5]?[0-9])"([0-9]{0,2})?$/,
  /^([0-5]?[0-9])m([0-5]?[0-9])s([0-9]{0,2})?$/,
  /^([0-5]?[0-9])min([0-5]?[0-9])sec([0-9]{0,2})?$/,
  /^([0-5]?[0-9]):([0-5]?[0-9]):([0-9]{1,2})$/,
  /^([0-5]?[0-9]):([0-5]?[0-9])$/,
]

export function parseTime(current_time_string: string) {
  let time_in_seconds: number|null = null
  for(const pattern of all_patterns) {
    time_in_seconds = getTime(current_time_string, pattern)
    if(typeof time_in_seconds === "number") {
      break
    }
  }
  return time_in_seconds
}
