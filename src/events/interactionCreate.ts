import { Events, type Client } from "discord.js"
import { handleAutoComplete, handleSlashCommand, handleSubmitModal, handleButton, handleStringSelectMenu, handleMenuCommand } from "@/libraries/discord/handlers"

export const interactionCreate = (client: Client): void => {
  client.on(Events.InteractionCreate, async (interaction) => {
    try {
      if (interaction.isContextMenuCommand()) {
        await handleMenuCommand(client, interaction)
      } else if (interaction.isCommand()) {
        await handleSlashCommand(client, interaction)
      } else if (interaction.isAutocomplete()) {
        await handleAutoComplete(client, interaction)
      } else if (interaction.isModalSubmit()) {
        await handleSubmitModal(client, interaction)
      } else if (interaction.isButton()) {
        await handleButton(client, interaction)
      } else if (interaction.isStringSelectMenu()) {
        await handleStringSelectMenu(client, interaction)
      }
    } catch(e) {
      console.error(e)
    }
  })
}
