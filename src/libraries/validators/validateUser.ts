import { CommandInteraction } from "discord.js"

export function validateUser(interaction: CommandInteraction, optionName: string) {
  const value = interaction.options.get(optionName)?.value
  if(typeof value === "string") {
    return value
  }
  return undefined
}
