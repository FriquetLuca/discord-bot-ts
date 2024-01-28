import {
  SlashCommandBuilder,
  type AutocompleteInteraction,
  type ButtonInteraction,
  type Client,
  type ModalSubmitInteraction,
  type StringSelectMenuInteraction,
  type ChatInputCommandInteraction,
  type CacheType,
} from "discord.js"
import { type Button, type Modal, type StringSelectMenu } from "../Command"
import { prisma } from "@/database/prisma"
import type { BaseHandler, InteractionHandler } from "./"
import { ensureError } from "@/libraries/sqeul";

export class ChatCommandBuilder extends SlashCommandBuilder {
  private hasCooldown: boolean = false;
  private cooldown: number = 0;
  private modals: Modal[] = [];
  private buttons: Button[] = [];
  private stringSelectMenus: StringSelectMenu[] = [];
  private _autocomplete: BaseHandler<AutocompleteInteraction> | undefined;
  private run: InteractionHandler<ChatInputCommandInteraction<CacheType>> = async () => {};
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
  public handleCommand(run: InteractionHandler<ChatInputCommandInteraction<CacheType>>) {
    this.run = run
    return this
  }
  public autocomplete(autocomplete: InteractionHandler<AutocompleteInteraction> | undefined) {
    this._autocomplete = async (client, interaction) => {
      if(!prisma) {
        await interaction.respond([])
        return
      }
      try {
        autocomplete && await autocomplete({
          client,
          interaction,
          prisma
        })
      } catch(e) {
        console.error(e)
        await interaction.respond([])
      }
    }
    return this
  }
  public build() {
    const currentBuild = this.toJSON()
    return {
      ...currentBuild,
      options: currentBuild.options?.sort((a, b) => {
        const lhs = (a as { required: boolean }).required ? -1 : 0;
        const rhs = (b as { required: boolean }).required ? 1 : 0;
        return lhs + rhs;
      }),
      hasCooldown: this.hasCooldown,
      cooldown: this.cooldown,
      autocomplete: this._autocomplete,
      run: async (client: Client, interaction: ChatInputCommandInteraction<CacheType>) => {
        if(!prisma) {
          await interaction.reply({
            ephemeral: true,
            content: "Erreur : Erreur interne du bot."
          })
          return
        }
        try {
          this.run && this.run({
            client,
            interaction,
            prisma
          })
        } catch(e) {
          console.error(e)
          try {
            await interaction.reply({
              ephemeral: true,
              content: `Erreur : ${ensureError(e).message}`
            })
          } catch(_) {
            try {
              await interaction.followUp({
                content: `Erreur : ${ensureError(e).message}`
              })
            } catch (_) {}
          }
        }
      },
    }
  }
}