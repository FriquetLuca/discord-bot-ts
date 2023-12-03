import { Events, Client } from "discord.js"
import { Commands } from "@/Commands"
import { Schedules } from "@/Schedules"

export default (client: Client): void => {
  client.on(Events.ClientReady, async () => {
    if (!client.user || !client.application) {
      return
    }
    await client.application.commands.set(Commands)
    Schedules.forEach(schedule => {
      schedule(client)
    })
  })
}
