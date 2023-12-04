import { CommandInteraction } from "discord.js"

export function validString(interaction: CommandInteraction, optionName: string) {
  const value = interaction.options.get(optionName)?.value
  if(typeof value === "string") {
    return value
  }
  return undefined
}
