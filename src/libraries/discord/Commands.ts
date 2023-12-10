import { Command } from "./Command"
import { loadModules } from "@/libraries/io"

export const Commands = loadModules<Command>(process.env.COMMANDS_PATH ?? "")
export const ContextMenuCommands = loadModules<Command>(process.env.COMMANDS_PATH ?? "")