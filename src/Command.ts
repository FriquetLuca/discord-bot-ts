import { CommandInteraction, ChatInputApplicationCommandData, Client, AutocompleteInteraction } from "discord.js"

export interface Command extends ChatInputApplicationCommandData {
  run: (client: Client, interaction: CommandInteraction) => Promise<void>
  autocomplete?: (client: Client, interaction: AutocompleteInteraction) => Promise<void>
} 