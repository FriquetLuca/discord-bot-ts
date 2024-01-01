import { bold, italic } from "discord.js"
import { chatCommandBuilder } from "@/libraries/discord/builders"
import { validator } from "@/libraries/discord/validators"

export const EditShopCart = chatCommandBuilder()
  .setName("edit-shop-cart")
  .setDescription("Modifier le nom d'un caddie")
  .addStringOption(option =>
    option.setName("hash")
    .setRequired(true)
    .setDescription("Le hash associé au caddie à renommer")
  )
  .addStringOption(option =>
    option.setName("name")
    .setRequired(true)
    .setDescription("Le nouveau nom du caddie")
  )
  .handleCommand(async ({ interaction, prisma }) => {
    
    const datas = validator(interaction)
      .string("hash", true)
      .string("name", true)
      .get()

    await interaction.deferReply()

    const cart = await prisma.shoppingMember.findFirst({
      where: {
        user_id: interaction.user.id,
        cart_id: datas.hash
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
          label: datas.name
        }
      })

      await interaction.followUp({
        content: `Votre caddie ${bold(cart.cart.label)} (${italic(`Hash: \`${cart.cart.id}\``)}) a été renommé en ${bold(datas.name)} avec succès.`
      })
    } else {
      await interaction.followUp({
        content: `Erreur : Le caddie ${bold(datas.hash)} n'existe pas.`
      })
    }
  })
  .build()
