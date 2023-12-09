import { Command } from "./Command"
import { loadModules } from "@/libraries/io"

export const Commands = loadModules<Command>(process.env.COMMANDS_PATH ?? "")
