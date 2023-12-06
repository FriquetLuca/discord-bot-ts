import type { Client, TextChannel } from "discord.js"
import { getClientChannels } from "./getClientChannels"

export function sendOnNamedChannels(client: Client, data: {
  channelName: string,
  message: string,
}) {
  getClientChannels(client)
    .filter(channel => {
      if(channel.isTextBased()) {
        return (channel as TextChannel).name.toLowerCase() === data.channelName.toLowerCase()
      }
      return false
    })
    .forEach(channel => {
      (channel as TextChannel).send(data.message)
    })
}
