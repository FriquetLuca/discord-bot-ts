import { GatewayIntentBits, Collection } from "discord.js"
import { DiscordClient, Events } from "@/libraries/discord"

export async function startClient(token: string) {

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
  for(const event of Events) {
    event(client)
  }
  client.login(token)
  console.log('Bot is now online.')
  
}
