import { Events, Client, Interaction, CommandInteraction, CacheType } from "discord.js"
import { Commands } from "@/Commands"

export default (client: Client): void => {
  client.on(Events.InteractionCreate, async (interaction: Interaction<CacheType>) => {
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
  });
};

const handleSlashCommand = async (client: Client, interaction: CommandInteraction): Promise<void> => {
  const slashCommand = Commands.find(c => c.name === interaction.commandName)
  if (!slashCommand) {
    interaction.followUp({ content: "An error has occurred" })
    return
  }
  await interaction.deferReply();
  slashCommand.run(client, interaction);
}