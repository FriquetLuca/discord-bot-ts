import { type Client, Collection, type ContextMenuCommandInteraction } from "discord.js"
import { ContextMenuCommands, type DiscordClient } from "@/libraries/discord"

export const handleMenuCommand = async (client: Client, interaction: ContextMenuCommandInteraction): Promise<void> => {
  const contextCommand = ContextMenuCommands.find(c => c.name === interaction.commandName)

  if (!contextCommand) {
    interaction.reply({ content: "La commande employée n'existe pas / plus." })
    return
  }

  if(contextCommand.hasCooldown) {

    const { cooldowns } = interaction.client as DiscordClient;
  
    if (!cooldowns.has(contextCommand.name)) {
      cooldowns.set(contextCommand.name, new Collection());
    }
  
    const now = Date.now();
    const timestamps = cooldowns.get(contextCommand.name) as Collection<string, number>
    const defaultCooldownDuration = 10000
    const cooldownAmount = (contextCommand.cooldown ?? defaultCooldownDuration) * 1000
  
    if (timestamps.has(interaction.user.id)) {
      const expirationTime = (timestamps.get(interaction.user.id) as number) + cooldownAmount
  
      if (now < expirationTime) {
        const expiredTimestamp = Math.round(expirationTime / 1000);
        interaction.reply({ content: `Please, wait before using the command \`${contextCommand.name}\` again. You'll be able to use it again <t:${expiredTimestamp}:R>.`, ephemeral: true })
        return
      }
    }
    contextCommand.run(client, interaction)
    timestamps.set(interaction.user.id, now)
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
  } else {
    contextCommand.run(client, interaction)
  }
}
