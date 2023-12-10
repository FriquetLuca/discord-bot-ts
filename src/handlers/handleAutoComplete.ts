import { Commands } from "@/libraries/discord"
import type { AutocompleteInteraction, Client } from "discord.js"

export const handleAutoComplete = async (client: Client, interaction: AutocompleteInteraction) => {
  const command = Commands.find(c => c.name === interaction.commandName)
  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`)
    return
  }
  try {
    command.autocomplete && await command.autocomplete(client, interaction)
  } catch (error) {
    console.error(error)
  }
}