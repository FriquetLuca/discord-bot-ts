import { bold, italic, userMention } from "discord.js"
import { chatCommandBuilder } from "@/libraries/discord/builders"
import { createPaginationButtons } from "@/libraries/discord/pagination/createPaginationButtons"
import { findCartArticlesCount } from "@/database/shopping/findCartArticlesCount"
import { findCurrentArticlesPage } from "@/database/shopping/findCurrentArticlesPage"
import { moneyFormat } from "@/libraries/money"

export const MyShopCartArticless = chatCommandBuilder()
  .setName("my-shop-cart-articles")
  .setDescription("Retrouvez les articles de vos courses actuellement dans votre caddie")
  .handleCommand(async ({ interaction, prisma }) => {
    const limit = 10
    let offset = 0
    const userId = interaction.user.id
    await interaction.deferReply()

    const shopContext = await prisma.shoppingContext.findUnique({
      where: {
        user_id: userId
      }
    })

    if(shopContext === null || shopContext.hash === null) {
      if(shopContext === null) {
        await interaction.followUp({
          content: `Erreur : Le caddie contextuel n'existe pas.`
        })
        return
      }
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

    const records = await findCurrentArticlesPage({ prisma, userId, cartId: cart.cart.id, limit, offset })
    const recordCount = await findCartArticlesCount({ prisma, userId, cartId: cart.cart.id })
    const fullPrice = moneyFormat((recordCount[0] ?? { full_price: 0 }).full_price)
    const count = Number((recordCount[0] ?? { count: BigInt(0) }).count)

    const { components, previousId, nextId } = createPaginationButtons({
      id: "my-shop-carts",
      previousButton: {
        label: "Précédent"
      },
      nextButton: {
        label: "Suivant"
      },
      offset,
      limit,
      count,
    })

    let index = offset * limit + 1
    const response = await interaction.followUp({
      content: `${bold(count.toString())} article${count > 1 ? 's' : ''} pour ${fullPrice}€ :\n${records.map(currentCart => {
        let updated = ""
        if(currentCart.updatedAt.getTime() !== currentCart.createdAt.getTime()) {
          updated = ` ${italic(`(modifié le ${currentCart.updatedAt.toLocaleDateString()} à ${currentCart.updatedAt.toLocaleTimeString()})`)}`
        }
        const isntMine = currentCart.recipient ? ` pour ${userMention(currentCart.recipient)}` : ''
        return `${index++}) ${currentCart.quantity}⨯ ${bold(currentCart.label)} à ${moneyFormat(currentCart.price)}€ l'unité (+${moneyFormat(currentCart.quantity * currentCart.price)}€) [${italic(`Hash: \`${currentCart.article_id}\``)}]${isntMine}, créer le ${currentCart.createdAt.toLocaleDateString()} à ${currentCart.createdAt.toLocaleTimeString()}${updated}.`
      }).join("\n")}`,
      components,
    })

    try {
      while(true) {
        const userResponse = await response.awaitMessageComponent({ filter: (i) => i.user.id === interaction.user.id, time: 180000 })
        if(userResponse.customId === nextId) {
          offset++
        } else if(userResponse.customId === previousId) {
          offset--
        } else {
          return;
        }
        
        const records = await findCurrentArticlesPage({ prisma, userId, cartId: cart.cart.id, limit, offset })
        const recordCount = await findCartArticlesCount({ prisma, userId, cartId: cart.cart.id })
        const fullPrice = moneyFormat((recordCount[0] ?? { full_price: 0 }).full_price)
        const count = Number((recordCount[0] ?? { count: BigInt(0) }).count)

        const { components } = createPaginationButtons({
          id: "my-shop-carts",
          previousButton: {
            label: "Précédent"
          },
          nextButton: {
            label: "Suivant"
          },
          offset,
          limit,
          count,
        })
        let index = offset * limit + 1
        await userResponse.update({
          content: `${bold(count.toString())} article${count > 1 ? 's' : ''} pour ${fullPrice}€ :\n${records.map(currentCart => {
            let updated = ""
            if(currentCart.updatedAt.getTime() !== currentCart.createdAt.getTime()) {
              updated = ` ${italic(`(modifié le ${currentCart.updatedAt.toLocaleDateString()} à ${currentCart.updatedAt.toLocaleTimeString()})`)}`
            }
            const isntMine = currentCart.recipient ? ` pour ${userMention(currentCart.recipient)}` : ''
            return `${index++}) ${currentCart.quantity}⨯ ${bold(currentCart.label)} à ${moneyFormat(currentCart.price)}€ l'unité (+${moneyFormat(currentCart.quantity * currentCart.price)}€) [${italic(`Hash: \`${currentCart.article_id}\``)}]${isntMine}, créer le ${currentCart.createdAt.toLocaleDateString()} à ${currentCart.createdAt.toLocaleTimeString()}${updated}.`
          }).join("\n")}`,
          components,
        });
      }
    } catch (e) {
      try {
        await interaction.deleteReply()
      } catch(e) {
        console.error(e)
      }
    }
  })
  .build()
