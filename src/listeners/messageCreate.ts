import { Events, type Client } from "discord.js"

export const messageCreate = (client: Client): void => {
  client.on(Events.MessageCreate, async (message) => {
    // console.log(message.content)
  })
}