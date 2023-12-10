import { Commands } from "@/libraries/discord";
import type { ButtonInteraction, Client } from "discord.js";

export const handleButton = async (client: Client, interaction: ButtonInteraction) => {
  let buttonFound = false;
  for(const command of Commands) {
    const button = command.buttons.find(b => b.customId === interaction.customId)
    if(button) {
      buttonFound = true
      try {
        await button.run(client, interaction)
      } catch (error) {
        console.error(error)
      }
      break
    }
  }
  if (!buttonFound) {
    console.error(`No button matching ${interaction.customId} was found.`)
    return
  }
}