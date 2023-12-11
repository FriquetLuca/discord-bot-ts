import { ApplicationCommandOptionType, ApplicationCommandType, bold, italic } from "discord.js"
import { commandBuilder } from "@/libraries/discord/builders"
import { optionCommandBuilder } from "@/libraries/discord/builders/optionCommandBuilder"

export const DeleteShopCart = commandBuilder()
  .name("delete-shop-cart")
  .description("Supprimer un caddie de course")
  .type(ApplicationCommandType.ChatInput)
  .addOption(
    optionCommandBuilder("hash", ApplicationCommandOptionType.String)
    .required(true)
    .description("Le hash associé au caddie à supprimer")
  )
  .handleCommand(async ({ interaction, prisma }) => {
    
    const currentHash = interaction.options.get("hash")?.value as string

    await interaction.deferReply()

    const cart = await prisma.shoppingMember.findFirst({
      where: {
        user_id: interaction.user.id,
        cart_id: currentHash,
        permission: "OWNER"
      },
      select: {
        cart_id: true,
        cart: {
          select: {
            label: true,
          }
        }
      }
    })

    if(cart !== null) {
      await prisma.shoppingArticle.deleteMany({
        where: cart
      })
  
      await prisma.shoppingMember.deleteMany({
        where: cart
      })
  
      await prisma.shoppingCart.deleteMany({
        where: {
          id: cart.cart_id
        }
      })
      
      await interaction.followUp({
        content: `Votre caddie ${bold(cart.cart.label)} (${italic(`Hash: \`${cart.cart_id}\``)}) a été supprimé avec succès.`
      })
    } else {
      await interaction.followUp({
        content: `Erreur : Le caddie ${bold(currentHash)} n'existe pas.`
      })
    }
  })
  .build()
