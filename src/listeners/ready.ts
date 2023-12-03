import { Events, Client } from "discord.js"
import { Commands } from "@/Commands"
import { Startups } from "@/Startups"

export default (client: Client): void => {
  client.on(Events.ClientReady, async () => {
    if (!client.user || !client.application) {
      return
    }
    await client.application.commands.set(Commands)
    Startups.forEach(startup => {
      startup(client)
    })
  })
}
