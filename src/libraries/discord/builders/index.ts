import {
  ApplicationCommandType,
  type Client,
  type MessageContextMenuCommandInteraction,
  type UserContextMenuCommandInteraction,
} from "discord.js"
import { type PrismaClient } from "@prisma/client"
import { ChatCommandBuilder } from "./ChatCommandBuilder"
import { GenericMenuCommandBuilder } from "./GenericMenuCommandBuilder"

export type BaseHandler<T> = (client: Client, interaction: T) => Promise<void>
export type InteractionHandler<T> = (ctx: { client: Client, interaction: T, prisma: PrismaClient }) => Promise<void>

export const chatCommandBuilder = () => new ChatCommandBuilder()

export const menuMessageCommandBuilder = () => new GenericMenuCommandBuilder<MessageContextMenuCommandInteraction>().setType(ApplicationCommandType.Message)

export const menuUserCommandBuilder = () => new GenericMenuCommandBuilder<UserContextMenuCommandInteraction>().setType(ApplicationCommandType.User)
