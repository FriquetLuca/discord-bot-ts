export function getTimestamp(killtimeBigInt: bigint) {
  const killtime = Number(killtimeBigInt.toString())
  const m = Math.floor(killtime / 100)
  return `${Math.floor(m / 60)}"${m % 60}'${killtime % 100}`
}
