import { ChatInputApplicationCommandData, type CommandInteraction, type Client, type AutocompleteInteraction } from "discord.js"

export interface Command extends ChatInputApplicationCommandData {
  hasCooldown: boolean
  cooldown: number
  run: (client: Client, interaction: CommandInteraction) => Promise<void>
  autocomplete?: (client: Client, interaction: AutocompleteInteraction) => Promise<void>
}
