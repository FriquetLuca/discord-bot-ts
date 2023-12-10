import { Commands } from "@/libraries/discord"
import type { Client, ModalSubmitInteraction } from "discord.js"

export const handleSubmitModal = async (client: Client, interaction: ModalSubmitInteraction) => {
  let modalFound = false;
  for(const command of Commands) {
    const modal = command.modals.find(m => m.customId === interaction.customId)
    if(modal) {
      modalFound = true
      try {
        await modal.run(client, interaction)
      } catch (error) {
        console.error(error)
      }
      break
    }
  }
  if (!modalFound) {
    console.error(`No modal matching ${interaction.customId} was found.`)
    return
  }
}