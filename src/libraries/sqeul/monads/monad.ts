export type Monad<Tag extends string, SubTag extends string, T> = {
  [K in Tag]: SubTag
} & {
  readonly value: T,
  unit: (value: T) => Monad<Tag, SubTag, T>,
  bind: (fn: (value: T) => T) => Monad<Tag, SubTag, T>
}

export type MonadGenerator<Tag extends string> = <SubTag extends string>(name: SubTag) => {
  unit: <T>(value: T) => Monad<Tag, SubTag, T>
}

export type MonadFactory<Tag extends string> = (type: Tag) => MonadGenerator<Tag>

/**
 * Create a monad factory to generate a monad.
 */
export function monadFactory<Tag extends string>(type: Tag): MonadGenerator<Tag> {
  const generator = <SubTag extends string>(name: SubTag) => ({
    unit: <T>(value: T) => {
      const result = {
        [type]: name,
        value,
        unit: monadFactory<Tag>(type)<SubTag>(name).unit<T>,
        bind: (fn: (value: T) => T) => monadFactory<Tag>(type)<SubTag>(name).unit(fn(value))
      }
      return result as Monad<Tag, SubTag, T>
    }
  })
  return generator
}
