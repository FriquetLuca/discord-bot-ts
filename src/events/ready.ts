import { Events, Routes, type Client } from "discord.js"
import { Args, ClientID, GuildIds, isProduction } from "../Bot"
import { AllCommands, Startups } from "@/libraries/discord"

export const ready = (client: Client): void => {
  client.on(Events.ClientReady, async () => {
    if (!client.user || !client.application) {
      return
    }
    console.log(`Logged in as ${client.user.tag}`)
    const shouldClean = Args.includes("clean")
    if(shouldClean) {
      if(isProduction) {
        try {
          await client.rest.put(Routes.applicationCommands(ClientID), { body: [] })
          console.log('Successfully deleted all application commands.')
        } catch(e) {
          console.error(e)
        }
      } else {
        for(const guild_id of GuildIds) {
          try {
            await client.rest.put(Routes.applicationGuildCommands(ClientID, guild_id), { body: [] })
            console.log('Successfully deleted all guild commands.')
          } catch(e) {
            console.error(e)
          }
        }
      }
    }
    try {
      if(isProduction) {
        await client.rest.put(
          Routes.applicationCommands(ClientID),
          { body: [ ...AllCommands ] },
        )
      } else {
        for(const guildId of GuildIds) {
          await client.rest.put(
            Routes.applicationGuildCommands(ClientID, guildId),
            { body: [ ...AllCommands ] },
          )
        }
      }
      Startups.forEach(startup => {
        startup(client)
      })
      console.log(`${client.user.tag} is now ready.`)
    } catch (error) {
      console.error(error);
    }
  })
}