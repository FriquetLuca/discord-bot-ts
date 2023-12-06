import { type Client, type ApplicationCommandType, type CommandInteraction, type AutocompleteInteraction, type CacheType, type ApplicationCommandOptionType } from "discord.js";
import { type OptionCommandBuilder } from "./optionCommandBuilder";
import { prisma } from "@/database/prisma"
import { type PrismaClient } from "@prisma/client";
import { type Command } from "@/Command";

export class CommandBuilder {
  private currentCommand: {
    name: string;
    description: string;
    type: ApplicationCommandType;
    options: unknown[];
    run: (ctx: { client: Client<boolean>, interaction: CommandInteraction, prisma: PrismaClient }) => void;
    autocomplete: ((client: Client<boolean>, interaction: AutocompleteInteraction<CacheType>) => Promise<void>) | undefined;
  };
  constructor(element: object) {
    this.currentCommand = element as typeof this.currentCommand
  }
  public name(name: string) {
    this.currentCommand.name = name
    return this
  }
  public description(description: string) {
    this.currentCommand.description = description
    return this
  }
  public type(type: ApplicationCommandType) {
    this.currentCommand.type = type
    return this
  }
  public addOption(option: OptionCommandBuilder<string, ApplicationCommandOptionType>) {
    this.currentCommand.options.push(option.build())
    return this
  }
  public handleCommand<A extends (ctx: { client: Client<boolean>, interaction: CommandInteraction, prisma: PrismaClient }) => void>(run: A) {
    this.currentCommand.run = run
    return this
  }
  public autocomplete<A extends ((ctx: { client: Client<boolean>, interaction: AutocompleteInteraction<CacheType> }) => Promise<void>) | undefined>(autocomplete: A) {
    this.currentCommand.autocomplete = async (client, interaction) => autocomplete && await autocomplete({
      client,
      interaction
    })
    return this
  }
  public build() {
    return {
      ...this.currentCommand,
      run: async (client: Client<boolean>, interaction: CommandInteraction) => {
        if(!prisma) {
          await interaction.followUp({
            ephemeral: true,
            content: "Erreur : Erreur interne du bot."
          })
          return
        }
        const context = {
          client,
          interaction,
          prisma
        }
        this.currentCommand.run && this.currentCommand.run(context)
      }
    } as unknown as Command
  }
}

export function commandBuilder() {
  return new CommandBuilder({
    options: []
  })
}
