import {
  type Client,
  type ApplicationCommandType,
  type CommandInteraction,
  type AutocompleteInteraction,
  type ApplicationCommandOptionType,
  type ModalSubmitInteraction,
  type ButtonInteraction,
  type StringSelectMenuInteraction
} from "discord.js";
import { type OptionCommandBuilder } from "./optionCommandBuilder";
import { prisma } from "@/database/prisma"
import { type PrismaClient } from "@prisma/client";
import type { Modal, Command, Button, StringSelectMenu } from "../Command";

export class CommandBuilder {
  private currentCommand: {
    name: string;
    description: string;
    type: ApplicationCommandType;
    options: unknown[];
    modals: Modal[];
    buttons: Button[];
    stringSelectMenus: StringSelectMenu[];
    hasCooldown: boolean;
    cooldown: number;
    nsfw: boolean;
    run: (ctx: { client: Client, interaction: CommandInteraction, prisma: PrismaClient }) => void;
    autocomplete: ((client: Client, interaction: AutocompleteInteraction) => Promise<void>) | undefined;
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
  public hasCooldown(hasCooldown: boolean) {
    this.currentCommand.hasCooldown = hasCooldown
    return this
  }
  public cooldown(cooldown: number) {
    this.currentCommand.cooldown = cooldown
    return this
  }
  public setCooldown(cooldown: number = 5000) {
    this.currentCommand.hasCooldown = true
    this.currentCommand.cooldown = cooldown
    return this
  }
  public isNSFW(nsfw: boolean = true) {
    this.currentCommand.nsfw = nsfw
    return this
  }
  public handleCommand<A extends (ctx: { client: Client, interaction: CommandInteraction, prisma: PrismaClient }) => void>(run: A) {
    this.currentCommand.run = run
    return this
  }
  public autocomplete<A extends ((ctx: { client: Client, interaction: AutocompleteInteraction }) => Promise<void>) | undefined>(autocomplete: A) {
    this.currentCommand.autocomplete = async (client, interaction) => autocomplete && await autocomplete({
      client,
      interaction
    })
    return this
  }
  public addModal(name: string, handleSubmit: (client: Client, interaction: ModalSubmitInteraction) => Promise<void>) {
    this.currentCommand.modals.push({
      customId: name,
      run: handleSubmit,
    })
  }
  public addButton(name: string, handleButton: (client: Client, interaction: ButtonInteraction) => Promise<void>) {
    this.currentCommand.buttons.push({
      customId: name,
      run: handleButton,
    })
  }
  public addStringSelectMenu(name: string, handleStringSelectMenu: (client: Client, interaction: StringSelectMenuInteraction) => Promise<void>) {
    this.currentCommand.stringSelectMenus.push({
      customId: name,
      run: handleStringSelectMenu,
    })
  }
  public build() {
    return {
      ...this.currentCommand,
      options: this.currentCommand.options.sort((a, b) => {
        // Required ordered before anything else
        const lhs = (a as { required: boolean }).required ? -1 : 0;
        const rhs = (b as { required: boolean }).required ? 1 : 0;
      
        return lhs + rhs;
      }),
      run: async (client: Client, interaction: CommandInteraction) => {
        if(!prisma) {
          await interaction.reply({
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
    hasCooldown: false,
    cooldown: 0,
    nsfw: false,
    options: [],
    modals: [],
    buttons: [],
    stringSelectMenus: [],
  })
}