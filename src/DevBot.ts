import { Client, Events, GatewayIntentBits, REST, Routes } from "discord.js"
import interactionCreate from "@/listeners/interactionCreate"
import dotenv from "dotenv"
import { Commands } from "./Commands"

dotenv.config()



const ClientID = process.env.BOT_ID ?? ""
if(!ClientID) {
  throw new Error("There's no client id for the bot to start.")
}

const token = process.env.DISCORD_TOKEN
if(!token) {
  throw new Error("There's no token for the bot to start.")
}

const GuildIds = JSON.parse(process.env.GUILD_IDS ?? "[]") as string[]
if(!Array.isArray(GuildIds)) {
  throw new Error("Something went wrong when parsing the guild ids.")
}

const client = new Client({
  intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
  ]
})

const rest = new REST({ version: '9' })
  .setToken(token);

client.on(Events.ClientReady, async () => {
  if (!client.user || !client.application) {
    return
  }
  console.log(`Logged in as ${client.user.tag}`)
  try {
    console.log('Started refreshing application (/) commands.');
    for(const guildId of GuildIds) {
      await rest.put(
        Routes.applicationGuildCommands(ClientID, guildId),
        { body: Commands },
      );
    }
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})

interactionCreate(client)
client.login(token)