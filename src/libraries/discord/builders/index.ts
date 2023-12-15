import {
  ApplicationCommandType,
  type Client,
  type MessageContextMenuCommandInteraction,
  type UserContextMenuCommandInteraction,
} from "discord.js"
import { type PrismaClient } from "@prisma/client"
import { ChatCommandBuilder } from "./ChatCommandBuilder"
import { MenuCommandBuilder } from "./GenericMenuCommandBuilder"

export type BaseHandler<T> = (client: Client, interaction: T) => Promise<void>
export type InteractionHandler<T> = (ctx: { client: Client, interaction: T, prisma: PrismaClient }) => Promise<void>

export const chatCommandBuilder = () => new ChatCommandBuilder()

export const menuMessageCommandBuilder = () => new MenuCommandBuilder<MessageContextMenuCommandInteraction>().setType(ApplicationCommandType.Message)

export const menuUserCommandBuilder = () => new MenuCommandBuilder<UserContextMenuCommandInteraction>().setType(ApplicationCommandType.User)
