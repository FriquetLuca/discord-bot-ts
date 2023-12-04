import { CommandInteraction } from "discord.js"

export function validNumber(interaction: CommandInteraction, optionName: string) {
  const value = interaction.options.get(optionName)?.value
  if(typeof value === "number") {
    return value
  }
  return undefined
}
