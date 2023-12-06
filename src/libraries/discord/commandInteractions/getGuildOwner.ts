import { type CommandInteraction } from "discord.js";

export const getGuildOwner = async (interaction: CommandInteraction) => interaction.guild?.fetchOwner()