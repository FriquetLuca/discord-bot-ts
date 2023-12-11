import {
  type Client,
  type ApplicationCommandType,
  type AutocompleteInteraction,
  type ModalSubmitInteraction,
  type ButtonInteraction,
  type StringSelectMenuInteraction,
  type ContextMenuCommandInteraction
} from "discord.js";
import { prisma } from "@/database/prisma"
import type { Modal, Command, Button, StringSelectMenu } from "../Command"
import type { BaseHandler, InteractionHandler } from "./commandBuilder"

export class MenuCommandBuilder {
  private currentCommand: {
    name: string;
    type: ApplicationCommandType.Message | ApplicationCommandType.User;
    modals: Modal[];
    buttons: Button[];
    stringSelectMenus: StringSelectMenu[];
    hasCooldown: boolean;
    cooldown: number;
    nsfw: boolean;
    run: InteractionHandler<ContextMenuCommandInteraction>
    autocomplete: BaseHandler<AutocompleteInteraction> | undefined;
  };
  constructor(element: object) {
    this.currentCommand = element as typeof this.currentCommand
  }
  public name(name: string) {
    this.currentCommand.name = name
    return this
  }
  public type(type: ApplicationCommandType.Message | ApplicationCommandType.User) {
    this.currentCommand.type = type
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
  public handleCommand<A extends InteractionHandler<ContextMenuCommandInteraction>>(run: A) {
    this.currentCommand.run = run
    return this
  }
  public autocomplete<A extends InteractionHandler<AutocompleteInteraction> | undefined>(autocomplete: A) {
    this.currentCommand.autocomplete = async (client, interaction) => {
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
    this.currentCommand.modals.push({
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
    this.currentCommand.buttons.push({
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
    this.currentCommand.stringSelectMenus.push({
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
      ...this.currentCommand,
      run: async (client: Client, interaction: ContextMenuCommandInteraction) => {
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

export function menuCommandBuilder() {
  return new MenuCommandBuilder({
    hasCooldown: false,
    cooldown: 0,
    nsfw: false,
    modals: [],
    buttons: [],
    stringSelectMenus: [],
  })
}
