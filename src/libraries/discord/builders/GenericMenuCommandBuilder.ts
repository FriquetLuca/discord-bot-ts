import {
  ContextMenuCommandBuilder,
  type ButtonInteraction,
  type Client,
  type MessageContextMenuCommandInteraction,
  type ModalSubmitInteraction,
  type StringSelectMenuInteraction,
  type UserContextMenuCommandInteraction
} from "discord.js"
import { type Button, type Modal, type StringSelectMenu } from "../Command"
import { prisma } from "@/database/prisma"
import { type InteractionHandler } from "./"

export class GenericMenuCommandBuilder<T extends (UserContextMenuCommandInteraction | MessageContextMenuCommandInteraction)> extends ContextMenuCommandBuilder {
  private hasCooldown: boolean = false;
  private cooldown: number = 0;
  private modals: Modal[] = [];
  private buttons: Button[] = [];
  private stringSelectMenus: StringSelectMenu[] = [];
  private run: InteractionHandler<T> = async () => {};
  public setActiveCooldown(hasCooldown: boolean = false) {
    this.hasCooldown = hasCooldown
  }
  public setCooldownTimer(cooldown: number = 5000) {
    this.cooldown = cooldown
  }
  public setCooldown(cooldown: number = 5000) {
    this.hasCooldown = true
    this.cooldown = cooldown
    return this
  }
  public addModal(name: string, handleSubmit: InteractionHandler<ModalSubmitInteraction>) {
    this.modals.push({
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
    this.buttons.push({
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
    this.stringSelectMenus.push({
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
  public handleCommand(run: InteractionHandler<T>) {
    this.run = run
    return this
  }
  public build() {
    const currentBuild = this.toJSON()
    return {
      ...currentBuild,
      hasCooldown: this.hasCooldown,
      cooldown: this.cooldown,
      run: async (client: Client, interaction: T) => {
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
        this.run && this.run(context)
      },
    }
  }
}