/**
 * Create a new instance of a class with it's parameter. This function act as a proxy for the constructor.
 * @param TheClass The class to use.
 * @param args The arguments of the class constructor.
 * @returns The instance of the class.
 */
export function newInstance<T extends new (...args: any) => unknown>(TheClass: T, ...args: [...ConstructorParameters<T>]) {
  return new TheClass(...args) as InstanceType<T>;
}
