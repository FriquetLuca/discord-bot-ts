import type { PrismaClient } from "@prisma/client"
import { type ApplicationCommandOptionType, ApplicationCommandType, type AutocompleteInteraction, type Client, type CommandInteraction } from "discord.js"
import { prisma } from "@/database/prisma"
import type { Button, Modal, StringSelectMenu } from "./Command"

type BaseHandler<T> = (client: Client, interaction: T) => Promise<void>
type InteractionHandler<T> = (ctx: { client: Client, interaction: T, prisma: PrismaClient }) => Promise<void>
type BuildInteractionHandler<T, U> = (ctx: { client: Client, interaction: T, prisma: PrismaClient, datas: U }) => Promise<void>

type Collapse<T> = T extends (...args: any[]) => any
  ? T
  : T extends object
    ? { [K in keyof T]: Collapse<T[K]> }
    : T

function option<T extends {
  name: string,
  type: ApplicationCommandOptionType,
  required: Req,
  choices: { name: string; value: string }[]
}, Req extends boolean = false>(data?: T) {
  const currentData: T = data === undefined ? {
    required: false as false,
    choices: [] as { name: string; value: string }[]
  } as T : data
  return {
    name: <U extends string>(name: U) => {
      return option<Omit<T, "name"> & {
        name: U
      }, Req>({
        ...currentData,
        name
      })
    },
    type: <U extends ApplicationCommandOptionType>(type: U) => {
      return option<Omit<T, "type"> & {
        type: U
      }, Req>({
        ...currentData,
        type
      })
    },
    required: <U extends boolean>(required: U) => {
      return option<Omit<T, "required"> & {
        required: U
      }, U>({
        ...currentData,
        required
      })
    },
    addChoice: (choice: { name: string; value: string }) => {
      currentData.choices.push(choice)
      return option<T, Req>(currentData)
    },
    addChoices: (choices: { name: string; value: string }[]) => {
      currentData.choices.push(...choices)
      return option<T, Req>(currentData)
    },
    build: () => currentData as Collapse<T>
  }
}

function command<T extends {
  type: ApplicationCommandType,
  options: Datas[],
  modals: Modal[],
  buttons: Button[],
  stringSelectMenus: StringSelectMenu[],
}, Datas extends {}>(data?: T) {
  const currentData: T = data === undefined ? {
    type: ApplicationCommandType.ChatInput as ApplicationCommandType.ChatInput,
    options: [] as Datas[],
    modals: [] as Modal[],
    buttons: [] as Button[],
    stringSelectMenus: [] as StringSelectMenu[],
  } as T : data

  type CleanOptions<T> = T extends { name: string } ? T : never
  type CleanedOptions = CleanOptions<Datas>
  type OptionType<N extends string, T> = T extends { name: N, type: ApplicationCommandOptionType.Boolean }
    ? { [K in N]?: boolean }
    : T extends { name: N, type: ApplicationCommandOptionType.Integer | ApplicationCommandOptionType.Number }
    ? { [K in N]?: number }
    : T extends { name: N, type: ApplicationCommandOptionType.User | ApplicationCommandOptionType.String }
    ? { [K in N]?: string }
    : never
  type PickRequiredKeys<T, K extends keyof T = keyof T> = Omit<T & Required<Pick<T, K & keyof T>>, never>
  type RequiredOptions<T> = T extends { name: infer N, required: true } ? N : never
  type Options = PickRequiredKeys<OptionType<CleanedOptions["name"], CleanedOptions>, RequiredOptions<CleanedOptions>>
  return {
    name: <U extends string>(name: U) => {
      return command<Omit<T, "name"> & {
        name: U
      }, Datas>({
        ...currentData,
        name
      })
    },
    type: <U extends ApplicationCommandType>(type: U) => {
      return command<Omit<T, "type"> & {
        type: U
      }, Datas>({
        ...currentData,
        type
      })
    },
    description: (description: string) => {
      return command<Omit<T, "description"> & {
        description: string
      }, Datas>({
        ...currentData,
        description
      })
    },
    hasCooldown: (hasCooldown: boolean) => {
      return command<Omit<T, "hasCooldown"> & {
        hasCooldown: boolean
      }, Datas>({
        ...currentData,
        hasCooldown
      })
    },
    cooldown: (cooldown: number) => {
      return command<Omit<T, "cooldown"> & {
        cooldown: number
      }, Datas>({
        ...currentData,
        cooldown
      })
    },
    setCooldown: (setCooldown: number = 5000) => {
      return command<Omit<T, "cooldown" | "hasCooldown"> & {
        hasCooldown: boolean,
        cooldown: number
      }, Datas>({
        ...currentData,
        hasCooldown: true,
        cooldown: setCooldown
      })
    },
    isNSFW: (isNSFW: boolean = true) => {
      return command<Omit<T, "isNSFW"> & {
        isNSFW: boolean
      }, Datas>({
        ...currentData,
        isNSFW
      })
    },
    addOption: <U extends {
      name: string,
      type: ApplicationCommandOptionType,
    }>(_option: U) => command<Omit<T, "options"> & { options: (Datas | U)[] }, Datas | U>({
      ...currentData,
      options: [
        ...currentData.options,
        _option
      ]
    }),
    autocomplete: (autocomplete: InteractionHandler<AutocompleteInteraction>) => {
      return command<Omit<T, "autocomplete"> & {
        autocomplete: BaseHandler<AutocompleteInteraction>
      }, Datas>({
        ...currentData,
        autocomplete: async (client, interaction) => {
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
      })
    },
    build: (handleCommand: BuildInteractionHandler<CommandInteraction, Collapse<PickRequiredKeys<OptionType<CleanedOptions["name"], CleanedOptions>, RequiredOptions<CleanedOptions>>>>) => {
      const mappedDatas: Record<string, (interaction: CommandInteraction) => unknown> = {};

      (currentData.options as Datas[]).forEach((data) => {
        const d = data as unknown as { name: string }
        mappedDatas[d.name] = (interaction: CommandInteraction) => interaction.options.get(d.name)?.value
      })

      const result = {
        ...currentData,
        options: currentData.options.sort((a, b) => {
          // Required ordered before anything else
          const lhs = (a as unknown as { required: boolean }).required ? -1 : 0
          const rhs = (b as unknown as { required: boolean }).required ? 1 : 0
          return lhs + rhs
        }) as Datas[],
        run: async (client: Client, interaction: CommandInteraction) => {
          if(!prisma) {
            await interaction.reply({
              ephemeral: true,
              content: "Erreur : Erreur interne du bot."
            })
            return
          }
          const datas = {} as Options
          for(const data in mappedDatas) {
            datas[data as keyof Options] = mappedDatas[data](interaction) as any
          }
          const context = {
            client,
            interaction,
            prisma,
            datas
          }
          handleCommand && handleCommand(context as any)
        }
      }
      return result as Collapse<typeof result>
    }
  }
}

export const Builder = {
  command,
  option
}