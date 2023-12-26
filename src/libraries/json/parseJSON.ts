export function parseJSON<T>(jsonString: string, reviver?: ((this: any, key: string, value: any) => any) | undefined): T {
  return JSON.parse(jsonString, (key, value) => {
    if (typeof value === 'string' && /^\d+n$/.test(value)) {
      return BigInt(value.slice(0, -1))
    }
    if (reviver) {
      return reviver(key, value)
    }
    return value
  })
}
