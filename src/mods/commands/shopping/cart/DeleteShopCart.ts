import { ApplicationCommandOptionType, bold, italic } from "discord.js"
import { chatCommandBuilder } from "@/libraries/discord/builders"
import { optionCommandBuilder } from "@/libraries/discord/builders/optionCommandBuilder"

export const DeleteShopCart = chatCommandBuilder()
  .setName("delete-shop-cart")
  .setDescription("Supprimer un caddie de course")
  .addStringOption(option =>
    option.setName("hash")
    .setDescription("Le hash associé au caddie à supprimer")
    .setRequired(true)
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
