import type { Command, MessageCommand, UserCommand } from "./Command"
import { loadModules } from "@/libraries/io"

export const Commands = loadModules<Command>(process.env.COMMANDS_PATH ?? "commands/")
export const UserMenuCommands = loadModules<UserCommand>(process.env.USER_CONTEXT_MENU_COMMANDS_PATH ?? "userCommands/")
export const MessageMenuCommands = loadModules<MessageCommand>(process.env.MESSAGE_CONTEXT_MENU_COMMANDS_PATH ?? "messageCommands/")
export const AllCommands = [...Commands, ...UserMenuCommands, ...MessageMenuCommands]
