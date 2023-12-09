import { Events, type Client, type CommandInteraction, Collection } from "discord.js"
import { Commands } from "@/libraries/discord/Commands"
import { DiscordClient } from "@/libraries/discord/DiscordClient"

export const interactionCreate = (client: Client): void => {
  client.on(Events.MessageCreate, async (message) => {
    console.log(message.content)
  })
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

const handleSlashCommand = async (client: Client, interaction: CommandInteraction): Promise<void> => {
  const slashCommand = Commands.find(c => c.name === interaction.commandName)
  if (!slashCommand) {
    interaction.followUp({ content: "La commande employée n'existe pas" })
    return
  }

  await interaction.deferReply();

  if(slashCommand.hasCooldown) {

    const { cooldowns } = interaction.client as DiscordClient;
  
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
        interaction.reply({ content: `S'il vous plaît, attendez avant d'utiliser à nouveau la commande : \`${slashCommand.name}\`. Vous pourrez l'utiliser à nouveau d'ici <t:${expiredTimestamp}:R>.`, ephemeral: true })
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