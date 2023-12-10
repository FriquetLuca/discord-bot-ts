import { Commands } from "@/libraries/discord";
import type { StringSelectMenuInteraction, Client } from "discord.js";

export const handleStringSelectMenu = async (client: Client, interaction: StringSelectMenuInteraction) => {
  let ssmFound = false;
  for(const command of Commands) {
    const stringSelectMenus = command.stringSelectMenus.find(ssm => ssm.customId === interaction.customId)
    if(stringSelectMenus) {
      ssmFound = true
      try {
        await stringSelectMenus.run(client, interaction)
      } catch (error) {
        console.error(error)
      }
      break
    }
  }
  if (!ssmFound) {
    console.error(`No string select menu matching ${interaction.customId} was found.`)
    return
  }
}