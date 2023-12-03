import { REST, Routes } from "discord.js"
import dotenv from "dotenv"

dotenv.config();
if(!process.env.DISCORD_TOKEN) {
  throw new Error("There's no token for the bot to start.")
}
if(!process.env.BOT_ID) {
  throw new Error("There's no client bot id for the bot to be cleaned of it's commands.")
}

const token = process.env.DISCORD_TOKEN
const ClientID = process.env.BOT_ID
const GuildIds = JSON.parse(process.env.GUILD_IDS ?? "[]")

if(!Array.isArray(GuildIds)) {
  throw new Error("Something went wrong when parsing the guild ids.")
}

console.log("Cleaning bot commands...")
const rest = new REST().setToken(token)

for(const guild_id of GuildIds) {
  rest.put(Routes.applicationGuildCommands(ClientID, guild_id), { body: [] })
  .then(() => console.log('Successfully deleted all guild commands.'))
  .catch(console.error)
}

rest.put(Routes.applicationCommands(ClientID), { body: [] })
  .then(() => console.log('Successfully deleted all application commands.'))
  .catch(console.error)