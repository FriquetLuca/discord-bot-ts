const allPatterns = [
  ".",
  ",",
  "€",
]

function unsafeParseMoney(current_time_string: string) {
  const sign = current_time_string[0] !== "-"
  if(!sign) {
    current_time_string = current_time_string.substring(1)
  }
  for(const pattern of allPatterns) {
    if(current_time_string.indexOf(pattern) !== -1) {
      const splitted = current_time_string.split(pattern)
      const lhs = splitted[0]
      const rhs = splitted[1]
      return {
        sign,
        lhs: parseInt(lhs.length === 0 ? "0" : lhs),
        rhs: parseInt(rhs.length === 0 ? "0" : rhs),
      }
    }
  }
  return {
    sign,
    lhs: parseInt(current_time_string),
    rhs: parseInt("0"),
  }
}

export function parseMoney(current_time_string: string, currencyDigits: number = 2) {
  const result = unsafeParseMoney(current_time_string)
  if(Number.isNaN(result.lhs) || !Number.isSafeInteger(result.lhs)) {
    result.lhs = 0
  }
  if(Number.isNaN(result.rhs) || !Number.isSafeInteger(result.rhs)) {
    result.rhs = 0
  }
  const digits = Math.pow(10, currencyDigits)
  return (result.lhs * digits + (result.rhs % digits)) * (result.sign ? 1 : -1)
}

export function moneyFormat(amount: number) {
  const l = Math.floor(amount % 100).toString()
  return `${Math.floor(amount / 100)},${l.length === 2 ? l : `0${l}`}`    
}

// console.log(parseMoney("125"))
// console.log(parseMoney("125.13"))
// console.log(parseMoney("125,13"))
// console.log(parseMoney("125€13"))
// console.log(parseMoney(".13"))
// console.log(parseMoney(",13"))
// console.log(parseMoney("€13"))
// console.log(parseMoney("-125"))
// console.log(parseMoney("-125.13"))
// console.log(parseMoney("-125,13"))
// console.log(parseMoney("-125€13"))
// console.log(parseMoney("-.13"))
// console.log(parseMoney("-,13"))
// console.log(parseMoney("-€13"))