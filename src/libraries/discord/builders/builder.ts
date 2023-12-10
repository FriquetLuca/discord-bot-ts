// import { PrismaClient } from "@prisma/client"
// import { ApplicationCommandOptionType, ApplicationCommandType, AutocompleteInteraction, Client, CommandInteraction } from "discord.js"
// import { prisma } from "@/database/prisma"
// import { Button, Modal, StringSelectMenu } from "../Command"

// export type BaseHandler<T> = (client: Client, interaction: T) => Promise<void>
// export type InteractionHandler<T> = (ctx: { client: Client, interaction: T, prisma: PrismaClient }) => Promise<void>

// export type Collapse<T> = T extends (...args: any[]) => any
//   ? T
//   : T extends object
//     ? { [K in keyof T]: Collapse<T[K]> }
//     : T

// function option<T extends {
//   name: string,
//   type: ApplicationCommandOptionType,
//   required: Req,
//   choices: { name: string; value: string }[]
// }, Req extends boolean = false>(data?: T) {
//   const currentData: T = data === undefined ? {
//     required: false as false,
//     choices: [] as { name: string; value: string }[]
//   } as T : data
//   return {
//     name: <U extends string>(name: U) => {
//       return option<T & {
//         name: U
//       }, Req>({
//         ...currentData,
//         name
//       })
//     },
//     type: <U extends ApplicationCommandOptionType>(type: U) => {
//       return option<T & {
//         type: U
//       }, Req>({
//         ...currentData,
//         type
//       })
//     },
//     required: <U extends boolean>(required: U) => {
//       return option<T & {
//         required: U
//       }, U>({
//         ...currentData,
//         required
//       })
//     },
//     addChoice: (choice: { name: string; value: string }) => {
//       currentData.choices.push(choice)
//       return option<T, Req>(currentData)
//     },
//     addChoices: (choices: { name: string; value: string }[]) => {
//       currentData.choices.push(...choices)
//       return option<T, Req>(currentData)
//     },
//     build: () => currentData as Collapse<T>
//   }
// }

// function command<T extends {
//   type: ApplicationCommandType.ChatInput,
//   options: Datas[],
//   modals: Modal[],
//   buttons: Button[],
//   stringSelectMenus: StringSelectMenu[],
// }, Datas extends {}>(data?: T) {
//   const currentData: T = data === undefined ? {
//     type: ApplicationCommandType.ChatInput as ApplicationCommandType.ChatInput,
//     options: [] as Datas[],
//     modals: [] as Modal[],
//     buttons: [] as Button[],
//     stringSelectMenus: [] as StringSelectMenu[],
//   } as T : data
//   return {
//     name: <U extends string>(name: U) => {
//       return command<T & {
//         name: U
//       }, Datas>({
//         ...currentData,
//         name
//       })
//     },
//     description: (description: string) => {
//       return command<T & {
//         description: string
//       }, Datas>({
//         ...currentData,
//         description
//       })
//     },
//     hasCooldown: (hasCooldown: boolean) => {
//       return command<T & {
//         hasCooldown: boolean
//       }, Datas>({
//         ...currentData,
//         hasCooldown
//       })
//     },
//     cooldown: (cooldown: number) => {
//       return command<T & {
//         cooldown: number
//       }, Datas>({
//         ...currentData,
//         cooldown
//       })
//     },
//     setCooldown: (setCooldown: number) => {
//       return command<T & {
//         setCooldown: number
//       }, Datas>({
//         ...currentData,
//         setCooldown
//       })
//     },
//     isNSFW: (isNSFW: boolean = true) => {
//       return command<T & {
//         isNSFW: boolean
//       }, Datas>({
//         ...currentData,
//         isNSFW
//       })
//     },
//     autocomplete: (autocomplete: InteractionHandler<AutocompleteInteraction>) => {
//       return command<T & {
//         autocomplete: BaseHandler<AutocompleteInteraction>
//       }, Datas>({
//         ...currentData,
//         autocomplete: async (client, interaction) => {
//           if(!prisma) {
//             await interaction.respond([])
//             return
//           }
//           autocomplete && await autocomplete({
//             client,
//             interaction,
//             prisma
//           })
//         }
//       })
//     },
//     build: (handleCommand: InteractionHandler<CommandInteraction>) => {
//       const result = {
//         ...currentData,
//         options: currentData.options as Datas[],
//         run: async (client: Client, interaction: CommandInteraction) => {
//           if(!prisma) {
//             await interaction.reply({
//               ephemeral: true,
//               content: "Erreur : Erreur interne du bot."
//             })
//             return
//           }
//           const extractedDatas = {} as (typeof result)["options"][number]
//           const context = {
//             client,
//             interaction,
//             prisma,
//             extractedDatas
//           }
//           handleCommand && handleCommand(context)
//         }
//       }
//       return result
//     },
//     addOption: <U extends {
//       name: string,
//       type: ApplicationCommandOptionType,
//     }>(_option: U) => command<T, Datas | U>({
//       ...currentData,
//       options: [
//         ...currentData.options,
//         _option
//       ]
//     })
//   }
// }


// const optA = option()
//   .name("something")
//   .type(ApplicationCommandOptionType.String)
//   .build()
// const optB = option()
//   .name("something-else")
//   .type(ApplicationCommandOptionType.String)
//   .build()

// const result = command()
//   .name("hello")
//   .description("something something")
//   .isNSFW()
//   .addOption(optA)
//   .addOption(optB)
//   .build(async () => {})


// type CleanOptions<T> = T extends { name: string } ? T : never
// type CleanedOptions = CleanOptions<(typeof result)["options"][number]>
// type OptionType<N extends string, T> = T extends { name: N, type: ApplicationCommandOptionType.Boolean }
//   ? { [K in N]?: boolean }
//   : T extends { name: N, type: ApplicationCommandOptionType.Integer | ApplicationCommandOptionType.Number }
//   ? { [K in N]?: number }
//   : T extends { name: N, type: ApplicationCommandOptionType.User | ApplicationCommandOptionType.String }
//   ? { [K in N]?: string }
//   : never
// type PickRequiredKeys<T, K extends keyof T = keyof T> = Omit<T & Required<Pick<T, K & keyof T>>, never>
// type RequiredOptions<T> = T extends { name: infer N, required: true } ? N : never
// type Options = PickRequiredKeys<OptionType<CleanedOptions["name"], CleanedOptions>, RequiredOptions<CleanedOptions>>
