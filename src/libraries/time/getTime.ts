export function getTime(time_string: string, pattern: RegExp) {
  // Handle the parsing for time
  const matchResult = pattern.exec(time_string)
  if(matchResult) {
    const current_time = {
      minutes: parseInt((matchResult && matchResult[1]) ?? "0"),
      seconds: parseInt((matchResult && matchResult[2]) ?? "0"),
      centiseconds: parseInt((matchResult && matchResult[3]) ?? "0")
    }
    return Math.floor(current_time.minutes * 6000 + current_time.seconds * 100 + current_time.centiseconds)
  }
  return null
}
