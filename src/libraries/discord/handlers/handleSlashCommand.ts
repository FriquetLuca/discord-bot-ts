import { type Client, Collection, type ChatInputCommandInteraction, type CacheType } from "discord.js"
import { Commands, type DiscordClient } from "../"

export const handleSlashCommand = async (client: Client, interaction: ChatInputCommandInteraction<CacheType>): Promise<void> => {
  const slashCommand = Commands.find(c => c.name === interaction.commandName)
  if (!slashCommand) {
    interaction.reply({ content: "La commande employée n'existe pas / plus." })
    return
  }

  if(slashCommand.hasCooldown) {

    const { cooldowns } = interaction.client as DiscordClient
    if (!cooldowns.has(slashCommand.name)) {
      cooldowns.set(slashCommand.name, new Collection());
    }
  
    const now = Date.now();
    const timestamps = cooldowns.get(slashCommand.name) as Collection<string, number>
    const defaultCooldownDuration = 10000
    const cooldownAmount = (slashCommand.cooldown ?? defaultCooldownDuration) * 1000
  
    if (timestamps.has(interaction.user.id)) {
      const expirationTime = (timestamps.get(interaction.user.id) as number) + cooldownAmount
  
      if (now < expirationTime) {
        const expiredTimestamp = Math.round(expirationTime / 1000);
        interaction.reply({ content: `Please, wait before using the command \`${slashCommand.name}\` again. You'll be able to use it again <t:${expiredTimestamp}:R>.`, ephemeral: true })
        return
      }
    }
    slashCommand.run(client, interaction)
    timestamps.set(interaction.user.id, now)
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
  } else {
    slashCommand.run(client, interaction)
  }
}
