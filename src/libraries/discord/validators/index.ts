import { fromRecord } from "@/libraries/sqeul"
import type { CommandInteraction } from "discord.js"
import { validBoolean } from "./validBoolean"
import { validNumber } from "./validNumber"
import { validString } from "./validString"
import { validElement } from "./validElement"

export * from "./validBoolean"
export * from "./validElement"
export * from "./validNumber"
export * from "./validString"

export type DiscordValidator<T extends Record<string|number|symbol, any>> = {
  get: () => T
  any: <U extends string, F>(property: U, mapper: (value: string | number | boolean | undefined) => F) => DiscordValidator<{ [K in keyof (T & { [K in U]: F; })]: (T & { [K in U]: F; })[K]; }>
  bool: <U extends string, Req extends boolean = false>(property: U, required?: Req | undefined, overrideErrorMessage?: string) => DiscordValidator<
    Req extends true
      ? { [K in keyof (T & { [K in U]: boolean })]: (T & { [K in U]: boolean })[K]; }
      : { [K in keyof (T & { [K in U]?: boolean })]: (T & { [K in U]?: boolean })[K]; }
  >
  number: <U extends string, Req extends boolean = false>(property: U, required?: Req | undefined, overrideErrorMessage?: string) => DiscordValidator<
    Req extends true
      ? { [K in keyof (T & { [K in U]: number })]: (T & { [K in U]: number })[K]; }
      : { [K in keyof (T & { [K in U]?: number })]: (T & { [K in U]?: number })[K]; }
  >
  string: <U extends string, Req extends boolean = false>(property: U, required?: Req | undefined, overrideErrorMessage?: string) => DiscordValidator<
    Req extends true
      ? { [K in keyof (T & { [K in U]: string })]: (T & { [K in U]: string })[K]; }
      : { [K in keyof (T & { [K in U]?: string })]: (T & { [K in U]?: string })[K]; }
  >
  in: <U extends string, V, W extends Record<string, V>, Req extends boolean = false>(property: U, source: W, required?: Req | undefined, overrideErrorMessage?: string) => DiscordValidator<
    Req extends true
      ? { [K in keyof (T & { [K in U]: keyof W })]: (T & { [K in U]: keyof W })[K]; }
      : { [K in keyof (T & { [K in U]?: keyof W })]: (T & { [K in U]?: keyof W })[K]; }
  >
  required: <U extends keyof T>(property: U, overrideErrorMessage?: string) => DiscordValidator<Omit<T, U> & Pick<Required<T>, U>>
  refine: <F extends {}>(refine: (element: T) => F) => DiscordValidator<F>
}

export function validator<T extends {}>(interaction: CommandInteraction, record: T = {} as T): DiscordValidator<T> {
  return {
    get: () => record,
    any: <U extends string, F>(property: U, mapper: (value: string | number | boolean | undefined) => F) => validator(interaction, fromRecord(record).insert(property, mapper(interaction.options.get(property)?.value)).get()),
    bool: <U extends string, Req extends boolean = false>(property: U, required?: Req | undefined, overrideErrorMessage?: string) => {
      const result = validator(interaction, fromRecord(record).insert(property, validBoolean(interaction, property)).get())
      if(required === true) {
        return result.required(property, overrideErrorMessage) as any
      }
      return result as any
    },
    number: <U extends string, Req extends boolean = false>(property: U, required?: Req | undefined, overrideErrorMessage?: string) => {
      const result = validator(interaction, fromRecord(record).insert(property, validNumber(interaction, property)).get())
      if(required === true) {
        return result.required(property, overrideErrorMessage) as any
      }
      return result as any
    },
    string: <U extends string, Req extends boolean = false>(property: U, required?: Req, overrideErrorMessage?: string): DiscordValidator<
      Req extends true
        ? { [K in keyof (T & { [K in U]: string })]: (T & { [K in U]: string })[K]; }
        : { [K in keyof (T & { [K in U]?: string })]: (T & { [K in U]?: string })[K]; }
    > => {
      const result = validator(interaction, fromRecord(record).insert(property, validString(interaction, property)).get())
      if(required === true) {
        return result.required(property, overrideErrorMessage) as any
      }
      return result as any
    },
    in: <U extends string, V, W extends Record<string, V>, Req extends boolean = false>(property: U, source: W, required?: Req | undefined, overrideErrorMessage?: string) => {
      const result = validator(interaction, fromRecord(record).insert(property, validElement(interaction, property, source)).get())
      if(required === true) {
        return result.required(property, overrideErrorMessage) as any
      }
      return result as any
    },
    required: <U extends keyof T>(property: U, overrideErrorMessage?: string) => {
      if(record[property] === undefined) {
        throw new Error(overrideErrorMessage ?? `The property \`${property.toString()}\` is required.`)
      }
      return validator(interaction, record) as unknown as DiscordValidator<Omit<T, U> & Pick<Required<T>, U>>
    },
    refine: <F extends {}>(refine: (element: T) => F) => validator(interaction, refine(record)),
  }
}
