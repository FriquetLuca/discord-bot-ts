import { AllCommands } from "../"
import type { Client, ModalSubmitInteraction } from "discord.js"

export const handleSubmitModal = async (client: Client, interaction: ModalSubmitInteraction) => {
  for(const command of AllCommands) {
    const modal = command.modals.find(m => m.customId === interaction.customId)
    if(modal) {
      try {
        await modal.run(client, interaction)
      } catch (error) {
        console.error(error)
      }
      break
    }
  }
}