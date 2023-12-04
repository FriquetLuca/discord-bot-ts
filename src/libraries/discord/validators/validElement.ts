import { CommandInteraction } from "discord.js"

export function validElement<U, T extends Record<string, U>>(interaction: CommandInteraction, optionName: string, record: T) {
  const value = interaction.options.get(optionName)?.value
  return record[value as unknown as keyof T] as (keyof T|undefined);
}
