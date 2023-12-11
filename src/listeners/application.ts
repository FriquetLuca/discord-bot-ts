import { Args, ClientID, GuildIds, isDevelopment } from "../Bot"
import { Events, GatewayIntentBits, REST, Routes, Collection } from "discord.js"
import { Commands, AllCommands, Startups, DiscordClient } from "@/libraries/discord"
import { interactionCreate } from "./"

export async function application(token: string) {
  const shouldClean = Args.includes("clean")

  const rest = new REST({ version: '9' })
    .setToken(token)

  if(shouldClean) {
    for(const guild_id of GuildIds) {
      try {
        await rest.put(Routes.applicationGuildCommands(ClientID, guild_id), { body: [] })
        console.log('Successfully deleted all guild commands.')
      } catch(e) {
        console.error(e)
      }
    }
    try {
      await rest.put(Routes.applicationCommands(ClientID), { body: [] })
      console.log('Successfully deleted all application commands.')
    } catch(e) {
      console.error(e)
    }
  }

  const client = new DiscordClient({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.DirectMessages,
    ]
  })
  
  client.cooldowns = new Collection()
  
  client.on(Events.ClientReady, async () => {
    if (!client.user || !client.application) {
      return
    }
    console.log(`Logged in as ${client.user.tag}`)
    try {
      
      console.log('Started application commands.')
      if(isDevelopment) {
        for(const guildId of GuildIds) {
          await rest.put(
            Routes.applicationGuildCommands(ClientID, guildId),
            { body: [ ...AllCommands ] },
          )
        }
      }
      await rest.put(
        Routes.applicationCommands(ClientID),
        { body: [ ...AllCommands ] },
      )
      console.log('Successfully loaded application commands.')

      console.log('Started application startups.')
      Startups.forEach(startup => {
        startup(client)
      })
      console.log('Successfully loaded application startups.')

    } catch (error) {
      console.error(error);
    }
  })
  interactionCreate(client)
  client.login(token)
  console.log('Bot is now online.')
}