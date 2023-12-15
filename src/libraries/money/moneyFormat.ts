export function moneyFormat(amount: number) {
  const l = Math.floor(amount % 100).toString()
  return `${Math.floor(amount / 100)},${l.length === 2 ? l : `0${l}`}`    
}
