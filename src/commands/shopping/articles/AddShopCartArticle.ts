import { chatCommandBuilder } from "@/libraries/discord/builders"
import { validator } from "@/libraries/discord/validators"
import { parseMoney } from "@/libraries/money"
import { bold, italic } from "discord.js"

export const AddShopCartArticle = chatCommandBuilder()
  .setName("add-shop-cart-article")
  .setDescription("Ajouter un article à votre caddie contextuel.")
  .addStringOption(option =>
    option.setName("label")
    .setRequired(true)
    .setDescription("Le nom associé à l'article")
  )
  .addStringOption(option =>
    option.setName("price")
    .setRequired(true)
    .setDescription("Le prix de l'article")
  )
  .addNumberOption(option =>
    option.setName("quantity")
    .setRequired(true)
    .setDescription("La quantité de fois que l'article a été acheté (un nombre strictement positif)")
  )
  .addUserOption(option =>
    option.setName("recipient")
    .setRequired(false)
    .setDescription("La personne pour qui on achète l'article")
  )
  .handleCommand(async ({ interaction, prisma }) => {

    const datas = validator(interaction)
      .string("label", true)
      .string("price", true)
      .number("quantity", true)
      .string("recipient")
      .refine(record => ({
        ...record,
        quantity: Math.max(1, Math.floor(record.quantity)),
        price: parseMoney(record.price)
      }))
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
        content: "Le caddie contextuel est indéfini."
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
        content: "Erreur : Le caddie contextuel est actuellement associé à un caddie qui n'existe plus."
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
            id: true,
            label: true,
          }
        },
      }
    })

    if(cart === null) {
      await interaction.followUp({
        content: "Erreur : Le caddie contextuel n'existe pas."
      })
      return
    }

    const newArticle = await prisma.shoppingArticle.create({
      data: {
        cart_id: shopContext.hash,
        ...datas,
      }
    })
    
    await interaction.followUp({
      content: `Votre article ${bold(newArticle.label)} (${italic(`Hash: ${newArticle.id}`)}) a été créé avec succès.`
    })

  })
  .build()
