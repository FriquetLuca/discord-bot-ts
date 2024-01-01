export const stringifyJSON = <T>(obj: T, replacer?: ((this: any, key: string, value: any) => any) | undefined, space: string | number = 2) => JSON.stringify(obj, (key, value) => {
  if (replacer) {
    return replacer(key, value);
  }
  if (typeof value === 'bigint') {
    return `${value}n`;
  }
  return value;
}, space)
