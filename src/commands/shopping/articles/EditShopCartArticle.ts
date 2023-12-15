import { chatCommandBuilder } from "@/libraries/discord/builders"
import { parseMoney } from "@/libraries/money"
import { bold, italic } from "discord.js"

export const EditShopCartArticle = chatCommandBuilder()
  .setName("edit-shop-cart-article")
  .setDescription("Modifier un article à votre caddie contextuel.")
  .addStringOption(option =>
    option.setName("hash")
    .setRequired(true)
    .setDescription("Le hash associé à l'article")
    .setAutocomplete(true)
  )
  .addStringOption(option =>
    option.setName("label")
    .setDescription("Le nom associé à l'article")
  )
  .addStringOption(option =>
    option.setName("price")
    .setDescription("Le prix de l'article")
  )
  .addNumberOption(option =>
    option.setName("quantity")
    .setDescription("La quantité de fois que l'article a été acheté (un nombre strictement positif)")
  )
  .addUserOption(option =>
    option.setName("recipient")
    .setDescription("La personne pour qui on achète l'article")
  )
  .handleCommand(async ({ interaction, prisma }) => {
    
    const currentHash = interaction.options.get("hash")?.value as string

    const currentLabel = interaction.options.get("label")?.value as string|undefined

    const inputPrice = interaction.options.get("price")?.value as string|undefined
    const currentPrice = inputPrice !== undefined ? parseMoney(inputPrice) : inputPrice

    const inputRecipient = interaction.options.get("recipient")?.value as string|undefined
    const currentRecipient = inputRecipient === "" ? null : inputRecipient

    const inputQuantity = interaction.options.get("quantity")?.value as number|undefined
    const currentQuantity = inputQuantity !== undefined ? Math.max(1, Math.floor(inputQuantity)) : inputQuantity

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
            id: true,
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
    const article = await prisma.shoppingArticle.findFirst({
      where: {
        id: currentHash,
        cart_id: cart.cart.id,
      }
    })
    if(article === null) {
      await interaction.followUp({
        content: `Erreur : L'article dont le hash est ${currentHash} n'existe pas.`
      })
      return
    }

    const newArticle = await prisma.shoppingArticle.update({
      where: {
        id: currentHash,
      },
      data: {
        cart_id: shopContext.hash,
        label: currentLabel,
        price: currentPrice,
        quantity: currentQuantity,
        recipient: currentRecipient,
      }
    })
    
    await interaction.followUp({
      content: `Votre article ${bold(newArticle.label)} (${italic(`Hash: ${newArticle.id}`)}) a été modifié avec succès.`
    })

  })
  .autocomplete(async ({ interaction, prisma }) => {
    const shopContext = await prisma.shoppingContext.findUnique({
      where: {
        user_id: interaction.user.id,
      }
    })
    if(shopContext === null) {
      await interaction.respond([])
      return
    }
    if(shopContext.hash === null) {
      await interaction.respond([])
      return
    }
    const articles = await prisma.$queryRaw`
      WITH cart as (
        SELECT
          sc.id as id
        FROM
          ShoppingCart sc
        JOIN
            ShoppingMember sm
          ON
            (sc.id = sm.cart_id)
        WHERE (sc.id = ${shopContext.hash} AND sm.user_id = ${interaction.user.id})
      )
      SELECT
        sa.id as id,
        sa.label as label
      FROM
        ShoppingArticle sa
      JOIN
        cart c
        ON
          (c.id = sa.cart_id)
      WHERE (c.id = ${shopContext.hash})
      ` as { id: string, label: string }[]
    await interaction.respond(
      articles.map(article => ({ name: article.label, value: article.id })),
    )
  })
  .build()
