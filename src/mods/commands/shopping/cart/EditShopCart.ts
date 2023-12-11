import { ApplicationCommandOptionType, ApplicationCommandType, bold, italic } from "discord.js"
import { commandBuilder } from "@/libraries/discord/builders"
import { optionCommandBuilder } from "@/libraries/discord/builders/optionCommandBuilder"

export const EditShopCart = commandBuilder()
  .name("edit-shop-cart")
  .description("Modifier le nom d'un caddie")
  .type(ApplicationCommandType.ChatInput)
  .addOption(
    optionCommandBuilder("hash", ApplicationCommandOptionType.String)
    .required(true)
    .description("Le hash associé au caddie à renommer")
  )
  .addOption(
    optionCommandBuilder("name", ApplicationCommandOptionType.String)
    .required(true)
    .description("Le nouveau nom du caddie")
  )
  .handleCommand(async ({ interaction, prisma }) => {
    
    const currentHash = interaction.options.get("hash")?.value as string
    const currentName = interaction.options.get("name")?.value as string

    await interaction.deferReply()

    const cart = await prisma.shoppingMember.findFirst({
      where: {
        user_id: interaction.user.id,
        cart_id: currentHash
      },
      select: {
        cart: {
          select: {
            id: true,
            label: true,
          }
        },
      }
    })

    if(cart !== null) {

      await prisma.shoppingCart.update({
        where: {
          id: cart.cart.id
        },
        data: {
          label: currentName
        }
      })

      await interaction.followUp({
        content: `Votre caddie ${bold(cart.cart.label)} (${italic(`Hash: \`${cart.cart.id}\``)}) a été renommé en ${bold(currentName)} avec succès.`
      })
    } else {
      await interaction.followUp({
        content: `Erreur : Le caddie ${bold(currentHash)} n'existe pas.`
      })
    }
  })
  .build()
