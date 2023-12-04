import { type Client } from "discord.js"

export const getClientChannels = (client: Client) => client.channels.cache