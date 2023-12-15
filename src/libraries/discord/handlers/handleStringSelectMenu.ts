import { AllCommands } from "../"
import type { StringSelectMenuInteraction, Client } from "discord.js";

export const handleStringSelectMenu = async (client: Client, interaction: StringSelectMenuInteraction) => {
  for(const command of AllCommands) {
    const stringSelectMenus = command.stringSelectMenus.find(ssm => ssm.customId === interaction.customId)
    if(stringSelectMenus) {
      try {
        await stringSelectMenus.run(client, interaction)
      } catch (error) {
        console.error(error)
      }
      break
    }
  }
}