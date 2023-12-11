import { chatCommandBuilder } from "@/libraries/discord/builders"
import { parseMoney } from "@/libraries/money"
import { bold, italic } from "discord.js"

export const AddShopCartArticle = chatCommandBuilder()
  .setName("add-shop-cart-article")
  .setDescription("Ajouter un article à votre caddie.")
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
  .addUserOption(option =>
    option.setName("recipient")
    .setRequired(false)
    .setDescription("La personne pour qui on achète l'article")
  )
  .handleCommand(async ({ interaction, prisma }) => {
    
    const currentLabel = interaction.options.get("label")?.value as string
    const currentPrice = parseMoney(interaction.options.get("price")?.value as string)
    const currentRecipient = interaction.options.get("recipient")?.value as string|undefined

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

    const newArticle = await prisma.shoppingArticle.create({
      data: {
        cart_id: shopContext.hash,
        label: currentLabel,
        price: currentPrice,
        recipient: currentRecipient,
      }
    })
    
    await interaction.followUp({
      content: `Votre article ${bold(newArticle.label)} (${italic(`Hash: ${newArticle.id}`)}) a été créé avec succès.`
    })

  })
  .build()
