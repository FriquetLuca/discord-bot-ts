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
import { MenuCommandBuilder } from "./menuCommandBuilder";

export type BaseHandler<T> = (client: Client, interaction: T) => Promise<void>
export type InteractionHandler<T> = (ctx: { client: Client, interaction: T, prisma: PrismaClient }) => Promise<void>

export class CommandBuilder {
  private commandDatas: {
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
    run: InteractionHandler<CommandInteraction>;
    autocomplete: BaseHandler<AutocompleteInteraction> | undefined;
  };
  constructor(element: object) {
    //super(element)
    this.commandDatas = element as typeof this.commandDatas
  }
  public name(name: string) {
    this.commandDatas.name = name
    return this
  }
  public description(description: string) {
    this.commandDatas.description = description
    return this
  }
  public type(type: ApplicationCommandType) {
    this.commandDatas.type = type
    return this
  }
  public addOption(option: OptionCommandBuilder<string, ApplicationCommandOptionType>) {
    this.commandDatas.options.push(option.build())
    return this
  }
  public hasCooldown(hasCooldown: boolean) {
    this.commandDatas.hasCooldown = hasCooldown
    return this
  }
  public cooldown(cooldown: number) {
    this.commandDatas.cooldown = cooldown
    return this
  }
  public setCooldown(cooldown: number = 5000) {
    this.commandDatas.hasCooldown = true
    this.commandDatas.cooldown = cooldown
    return this
  }
  public isNSFW(nsfw: boolean = true) {
    this.commandDatas.nsfw = nsfw
    return this
  }
  public handleCommand<A extends InteractionHandler<CommandInteraction>>(run: A) {
    this.commandDatas.run = run
    return this
  }
  public autocomplete<A extends InteractionHandler<AutocompleteInteraction> | undefined>(autocomplete: A) {
    this.commandDatas.autocomplete = async (client, interaction) => {
      if(!prisma) {
        await interaction.respond([])
        return
      }
      autocomplete && await autocomplete({
        client,
        interaction,
        prisma
      })
    }
    return this
  }
  public addModal(name: string, handleSubmit: InteractionHandler<ModalSubmitInteraction>) {
    this.commandDatas.modals.push({
      customId: name,
      run: async (client, interaction) => {
        if(!prisma) {
          await interaction.reply({
            ephemeral: true,
            content: "Erreur : Erreur interne du bot."
          })
          return
        }
        await handleSubmit({
          client,
          interaction,
          prisma
        })
      },
    })
  }
  public addButton(name: string, handleButton: InteractionHandler<ButtonInteraction>) {
    this.commandDatas.buttons.push({
      customId: name,
      run: async (client, interaction) => {
        if(!prisma) {
          await interaction.reply({
            ephemeral: true,
            content: "Erreur : Erreur interne du bot."
          })
          return
        }
        await handleButton({
          client,
          interaction,
          prisma
        })
      },
    })
  }
  public addStringSelectMenu(name: string, handleStringSelectMenu: InteractionHandler<StringSelectMenuInteraction>) {
    this.commandDatas.stringSelectMenus.push({
      customId: name,
      run: async (client, interaction) => {
        if(!prisma) {
          await interaction.reply({
            ephemeral: true,
            content: "Erreur : Erreur interne du bot."
          })
          return
        }
        await handleStringSelectMenu({
          client,
          interaction,
          prisma
        })
      },
    })
  }
  public build() {
    return {
      ...this.commandDatas,
      options: this.commandDatas.options.sort((a, b) => {
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
        this.commandDatas.run && this.commandDatas.run(context)
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
