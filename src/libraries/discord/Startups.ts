import { type Client } from "discord.js"
import { loadModules } from "@/libraries/io"

export const Startups = loadModules<((client: Client) => void)>(process.env.STARTUPS_PATH ?? "")
