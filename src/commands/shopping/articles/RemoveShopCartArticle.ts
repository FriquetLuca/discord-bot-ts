import { chatCommandBuilder } from "@/libraries/discord/builders"
import { validator } from "@/libraries/discord/validators"
import { bold } from "discord.js"

export const RemoveShopCartArticle = chatCommandBuilder()
  .setName("remove-shop-cart-article")
  .setDescription("Retirer un article de votre caddie contextuel.")
  .addStringOption(option =>
    option.setName("hash")
    .setRequired(true)
    .setDescription("Le hash associé à l'article")
  )
  .handleCommand(async ({ interaction, prisma }) => {

    const datas = validator(interaction)
      .string("hash", true)
      .get()

    await interaction.deferReply()

    const shopContext = await prisma.shoppingContext.findUnique({
      where: {
        user_id: interaction.user.id,
      }
    })

    if(shopContext === null) {
      await interaction.followUp({
        content: `Erreur : Le caddie contextuel n'existe pas.`
      })
      return
    }

    if(shopContext.hash === null) {
      await interaction.followUp({
        content: `Le caddie contextuel est indéfini.`
      })
      return
    }

    const cartExist = await prisma.shoppingCart.findUnique({
      where: {
        id: shopContext.hash,
      }
    })
    if(cartExist === null) {
      await interaction.followUp({
        content: `Erreur : Le caddie contextuel est actuellement associé à un caddie qui n'existe plus.`
      })
      return
    }

    const cart = await prisma.shoppingMember.findFirst({
      where: {
        user_id: interaction.user.id,
        cart_id: shopContext.hash,
      },
      select: {
        cart: {
          select: {
            label: true,
          }
        },
      }
    })

    if(cart === null) {
      await interaction.followUp({
        content: `Erreur : Le caddie contextuel n'existe pas.`
      })
      return
    }

    await prisma.shoppingArticle.delete({
      where: {
        id: datas.hash
      }
    })
    
    await interaction.followUp({
      content: `Votre article a été retiré avec succès du caddie ${bold(cart.cart.label)}.`
    })

  })
  .build()
