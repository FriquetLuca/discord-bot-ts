export function getTimestamp(killtimeBigInt: bigint) {
  const killtime = Number(killtimeBigInt.toString())
  const m = Math.floor(killtime / 100)
  return Math.floor(m / 60) >= 60 ? `${Math.floor(m / 3600)}h ${Math.floor(m / 60) % 60}'${m % 60}"${killtime % 100}` : `${Math.floor(m / 60)}'${m % 60}"${killtime % 100}`
}
