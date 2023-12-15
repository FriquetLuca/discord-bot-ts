import { loadModules } from "@/libraries/io"
import { type Client } from "discord.js"

export const Events = loadModules<(client: Client) => void>(process.env.EVENTS_PATH ?? "events/")