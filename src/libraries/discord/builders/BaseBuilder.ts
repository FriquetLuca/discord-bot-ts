import { ApplicationCommandType, AutocompleteInteraction, ButtonInteraction, Client, CommandInteraction, ContextMenuCommandInteraction, MessageContextMenuCommandInteraction, ModalSubmitInteraction, SlashCommandBuilder, StringSelectMenuInteraction, UserContextMenuCommandInteraction } from "discord.js";
import { Button, Command, Modal, StringSelectMenu } from "../Command";
import { PrismaClient } from "@prisma/client";
import { prisma } from "@/database/prisma"

export type BaseHandler<T> = (client: Client, interaction: T) => Promise<void>
export type InteractionHandler<T> = (ctx: { client: Client, interaction: T, prisma: PrismaClient }) => Promise<void>

export type BaseBuilderDatas<Context, ApplicationType extends ApplicationCommandType = ApplicationCommandType, AdditionalDatas extends {} = {}> = {
  name: string;
  type: ApplicationType;
  hasCooldown: boolean;
  cooldown: number;
  nsfw: boolean;
  modals: Modal[];
  buttons: Button[];
  stringSelectMenus: StringSelectMenu[];
  run: InteractionHandler<Context>;
} & AdditionalDatas

abstract class BaseBuilder<
  Context,
  ApplicationType extends ApplicationCommandType = ApplicationCommandType,
  DataType extends BaseBuilderDatas<Context, ApplicationType> = BaseBuilderDatas<Context, ApplicationType>,  
> {
  protected datas: DataType
  constructor(element: object) {
    this.datas = element as DataType
  }
  public name(name: string) {
    this.datas.name = name
    return this
  }
  public hasCooldown(hasCooldown: boolean) {
    this.datas.hasCooldown = hasCooldown
    return this
  }
  public cooldown(cooldown: number) {
    this.datas.cooldown = cooldown
    return this
  }
  public setCooldown(cooldown: number = 5000) {
    this.datas.hasCooldown = true
    this.datas.cooldown = cooldown
    return this
  }
  public isNSFW(nsfw: boolean = true) {
    this.datas.nsfw = nsfw
    return this
  }
  public handleCommand<A extends InteractionHandler<Context>>(run: A) {
    this.datas.run = run
    return this
  }
  public addModal(name: string, handleSubmit: InteractionHandler<ModalSubmitInteraction>) {
    this.datas.modals.push({
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
    this.datas.buttons.push({
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
    this.datas.stringSelectMenus.push({
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
}

class MenuCommandBuilder extends BaseBuilder<ContextMenuCommandInteraction, ApplicationCommandType.User | ApplicationCommandType.Message> {
  public type(type: ApplicationCommandType.Message | ApplicationCommandType.User) {
    this.datas.type = type
    return this
  }
  public build() {
    return {
      ...this.datas,
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
        this.datas.run && this.datas.run(context)
      }
    } as unknown as Command
  }
}
class MenuMessageCommandBuilder extends BaseBuilder<MessageContextMenuCommandInteraction, ApplicationCommandType.Message> {
  constructor(element: object) {
    super({
      ...element,
      type: ApplicationCommandType.Message
    })
  }
  public build() {
    return {
      ...this.datas,
      run: async (client: Client, interaction: MessageContextMenuCommandInteraction) => {
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
        this.datas.run && this.datas.run(context)
      }
    } as unknown as Command
  }
}
class MenuUserCommandBuilder extends BaseBuilder<UserContextMenuCommandInteraction, ApplicationCommandType.User> {
  constructor(element: object) {
    super({
      ...element,
      type: ApplicationCommandType.User
    })
  }
  public build() {
    return {
      ...this.datas,
      run: async (client: Client, interaction: UserContextMenuCommandInteraction) => {
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
        this.datas.run && this.datas.run(context)
      }
    } as unknown as Command
  }
}

class ChatCommandBuilder extends SlashCommandBuilder {
  private hasCooldown: boolean = false;
  private cooldown: number = 0;
  private _autocomplete: BaseHandler<AutocompleteInteraction> | undefined;
  private run: InteractionHandler<CommandInteraction> = async () => {};
  public handleCommand<A extends InteractionHandler<CommandInteraction>>(run: A) {
    this.run = run
    return this
  }
  public setCooldown(hasCooldown: boolean = false) {
    this.hasCooldown = hasCooldown
  }
  public setHasCooldown(cooldown: number = 5000) {
    this.cooldown = cooldown
  }
  public autocomplete<A extends InteractionHandler<AutocompleteInteraction> | undefined>(autocomplete: A) {
    this._autocomplete = async (client, interaction) => {
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
        this.run && this.run(context)
      },
    }
  }
}

export const chatCommandBuilder = () => new ChatCommandBuilder()
export const menuCommandBuilder = () => new MenuCommandBuilder({
  hasCooldown: false,
  cooldown: 0,
  nsfw: false,
  modals: [],
  buttons: [],
  stringSelectMenus: [],
})
export const menuMessageCommandBuilder = () => new MenuMessageCommandBuilder({
  hasCooldown: false,
  cooldown: 0,
  nsfw: false,
  modals: [],
  buttons: [],
  stringSelectMenus: [],
})
export const menuUserCommandBuilder = () => new MenuUserCommandBuilder({
  hasCooldown: false,
  cooldown: 0,
  nsfw: false,
  modals: [],
  buttons: [],
  stringSelectMenus: [],
})
