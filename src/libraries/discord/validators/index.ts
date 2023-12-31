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
  bool: <U extends string>(property: U) => DiscordValidator<{ [K in keyof (T & { [K in U]: boolean | undefined; })]: (T & { [K in U]: boolean | undefined; })[K]; }>
  number: <U extends string>(property: U) => DiscordValidator<{ [K in keyof (T & { [K in U]: number | undefined; })]: (T & { [K in U]: number | undefined; })[K]; }>
  string: <U extends string>(property: U) => DiscordValidator<{ [K in keyof (T & { [K in U]: string | undefined; })]: (T & { [K in U]: string | undefined; })[K]; }>
  in: <U extends string, V, W extends Record<string, V>>(property: U, source: W) => DiscordValidator<{ [K in keyof (T & { [K in U]: keyof W | undefined; })]: (T & { [K in U]: keyof W | undefined; })[K]; }>
  required: <U extends keyof T>(property: U, overrideErrorMessage?: string) => DiscordValidator<Omit<T, U> & Pick<Required<T>, U>>
}

export function validator<T extends Record<string|number|symbol, any>>(interaction: CommandInteraction, record: T = {} as T): DiscordValidator<T> {
  return {
    get: () => record,
    any: <U extends string, F>(property: U, mapper: (value: string | number | boolean | undefined) => F) => validator(interaction, fromRecord(record).insert(property, mapper(interaction.options.get(property)?.value)).get()),
    bool: <U extends string>(property: U) => validator(interaction, fromRecord(record).insert(property, validBoolean(interaction, property)).get()),
    number: <U extends string>(property: U) => validator(interaction, fromRecord(record).insert(property, validNumber(interaction, property)).get()),
    string: <U extends string>(property: U) => validator(interaction, fromRecord(record).insert(property, validString(interaction, property)).get()),
    in: <U extends string, V, W extends Record<string, V>>(property: U, source: W) => validator(interaction, fromRecord(record).insert(property, validElement(interaction, property, source)).get()),
    required: <U extends keyof T>(property: U, overrideErrorMessage?: string) => {
      if(record[property] === undefined) {
        throw new Error(overrideErrorMessage ?? `The property \`${property.toString()}\` is required.`)
      }
      return validator(interaction, record) as unknown as DiscordValidator<Omit<T, U> & Pick<Required<T>, U>>
    }
  }
}
