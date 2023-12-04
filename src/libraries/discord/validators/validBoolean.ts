import { CommandInteraction } from "discord.js"

export function validBoolean(interaction: CommandInteraction, optionName: string) {
  const value = interaction.options.get(optionName)?.value
  if(typeof value === "boolean") {
    return value
  }
  return undefined
}
