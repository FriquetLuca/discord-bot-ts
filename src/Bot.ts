import { Client } from "discord.js";
import ready from "@/listeners/ready";
import interactionCreate from "@/listeners/interactionCreate";
import dotenv from "dotenv";
dotenv.config();
if(!process.env.DISCORD_TOKEN) {
  throw new Error("There's no token for the bot to start.");
}

interface Environment {
  DISCORD_TOKEN: string
};

const currentEnvironment: Environment = {
  DISCORD_TOKEN: process.env.DISCORD_TOKEN
};

console.log("Bot is starting...");

const client = new Client({
    intents: []
});
ready(client);
interactionCreate(client);
client.login(currentEnvironment.DISCORD_TOKEN);