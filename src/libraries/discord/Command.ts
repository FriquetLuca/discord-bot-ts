import {
  type CommandInteraction,
  type Client,
  type AutocompleteInteraction,
  type ModalSubmitInteraction,
  type ButtonInteraction,
  type StringSelectMenuInteraction,
  type UserContextMenuCommandInteraction,
  ChatInputApplicationCommandData,
  UserApplicationCommandData,
  MessageApplicationCommandData,
} from "discord.js"

type DiscordInteraction<T> = {
  customId: string;
  run: (client: Client, interaction: T) => Promise<void>
}

export type Modal = DiscordInteraction<ModalSubmitInteraction>
export type Button = DiscordInteraction<ButtonInteraction>
export type StringSelectMenu = DiscordInteraction<StringSelectMenuInteraction>

export interface Command extends ChatInputApplicationCommandData {
  buttons: Button[]
  stringSelectMenus: StringSelectMenu[]
  modals: Modal[]
  hasCooldown: boolean
  cooldown: number
  run: (client: Client, interaction: CommandInteraction) => Promise<void>
  autocomplete?: (client: Client, interaction: AutocompleteInteraction) => Promise<void>
}

export interface UserCommand extends UserApplicationCommandData {
  buttons: Button[]
  stringSelectMenus: StringSelectMenu[]
  modals: Modal[]
  hasCooldown: boolean
  cooldown: number
  run: (client: Client, interaction: UserContextMenuCommandInteraction) => Promise<void>
  autocomplete?: (client: Client, interaction: AutocompleteInteraction) => Promise<void>
}

export interface MessageCommand extends MessageApplicationCommandData {
  buttons: Button[]
  stringSelectMenus: StringSelectMenu[]
  modals: Modal[]
  hasCooldown: boolean
  cooldown: number
  run: (client: Client, interaction: UserContextMenuCommandInteraction) => Promise<void>
  autocomplete?: (client: Client, interaction: AutocompleteInteraction) => Promise<void>
}
