import { Events, type Client } from "discord.js"
import { Commands } from "@/libraries/discord"
import { handleSlashCommand } from "./handleSlashCommand"

export const interactionCreate = (client: Client): void => {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isCommand() || interaction.isContextMenuCommand()) {
      await handleSlashCommand(client, interaction)
    } else if (interaction.isAutocomplete()) {
      const command = Commands.find(c => c.name === interaction.commandName)
      if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`)
        return;
      }
      try {
        command.autocomplete && await command.autocomplete(client, interaction)
      } catch (error) {
        console.error(error)
      }
    }
  })
}
