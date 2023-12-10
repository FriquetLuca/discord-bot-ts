import { Events, type Client } from "discord.js"
import { handleAutoComplete, handleSlashCommand, handleSubmitModal, handleButton, handleStringSelectMenu, handleMenuCommand } from "../handlers"

export const interactionCreate = (client: Client): void => {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isCommand()) {
      await handleSlashCommand(client, interaction)
    } else if (interaction.isContextMenuCommand()) {
      await handleMenuCommand(client, interaction)
    } else if (interaction.isAutocomplete()) {
      await handleAutoComplete(client, interaction)
    } else if (interaction.isModalSubmit()) {
      await handleSubmitModal(client, interaction)
    } else if (interaction.isButton()) {
      await handleButton(client, interaction)
    } else if (interaction.isStringSelectMenu()) {
      await handleStringSelectMenu(client, interaction)
    }
  })
}
