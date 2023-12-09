import dotenv from "dotenv"
dotenv.config()

import { application } from "./listeners"

export const Args = process.argv.slice(2)

export const ClientID = process.env.BOT_ID as string
if(!ClientID) {
  throw new Error("There's no client id for the bot to start.")
}

export const GuildIds = JSON.parse(process.env.GUILD_IDS ?? "[]") as string[]
if(!Array.isArray(GuildIds)) {
  throw new Error("Something went wrong when parsing the guild ids.")
}

export const isDevelopment = Args.includes("dev")

const token = process.env.DISCORD_TOKEN as string
if(!token) {
  throw new Error("There's no token for the bot to start.")
}

application(token)