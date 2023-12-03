import { Client, GatewayIntentBits } from "discord.js"
import ready from "@/listeners/ready"
import interactionCreate from "@/listeners/interactionCreate"
import dotenv from "dotenv"

dotenv.config()
if(!process.env.DISCORD_TOKEN) {
  throw new Error("There's no token for the bot to start.")
}

const token = process.env.DISCORD_TOKEN

const client = new Client({
  intents: [ ]
})

ready(client)
interactionCreate(client)
client.login(token)