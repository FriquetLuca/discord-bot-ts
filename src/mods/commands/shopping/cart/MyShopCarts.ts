import { bold, italic } from "discord.js"
import { chatCommandBuilder } from "@/libraries/discord/builders"
import { findCurrentCartPage } from "@/database/shopping/findCurrentCartPage"
import { findCartCount } from "@/database/shopping/findCartCount"
import { createPaginationButtons } from "@/libraries/discord/pagination/createPaginationButtons"

export const MyShopCarts = chatCommandBuilder()
  .setName("my-shop-carts")
  .setDescription("Retrouvez les caddies de vos courses")
  .handleCommand(async ({ interaction, prisma }) => {
    const limit = 10
    let offset = 0
    const userId = interaction.user.id
    await interaction.deferReply()

    const records = await findCurrentCartPage({ prisma, userId, limit, offset, })
    const count = Number(((await findCartCount({ prisma, userId, }))[0] ?? { count: BigInt(0) }).count)

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
      content: `Tous vos caddies (total : ${bold(count.toString())}) :\n${records.map(currentCart => {
        let updated = ""
        if(currentCart.updatedAt.getTime() !== currentCart.createdAt.getTime()) {
          updated = ` ${italic(`(modifié le ${currentCart.updatedAt.toLocaleDateString()} à ${currentCart.updatedAt.toLocaleTimeString()})`)}`
        }
        return `${index++}) ${bold(currentCart.label)} (${italic(`Hash: \`${currentCart.cart_id}\``)}) créer le ${currentCart.createdAt.toLocaleDateString()} à ${currentCart.createdAt.toLocaleTimeString()}${updated}`
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
        
        const records = await findCurrentCartPage({ prisma, userId, limit, offset, })
        const count = Number(((await findCartCount({ prisma, userId, }))[0] ?? { count: BigInt(0) }).count)

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
          content: `Tous vos caddies (total : ${bold(count.toString())}) :\n${records.map(currentCart => {
            let updated = ""
            if(currentCart.updatedAt.getTime() !== currentCart.createdAt.getTime()) {
              updated = ` ${italic(`(modifié le ${currentCart.updatedAt.toLocaleDateString()} à ${currentCart.updatedAt.toLocaleTimeString()})`)}`
            }
            return `${index++}) ${bold(currentCart.label)} (${italic(`Hash: \`${currentCart.cart_id}\``)}) créer le ${currentCart.createdAt.toLocaleDateString()} à ${currentCart.createdAt.toLocaleTimeString()}${updated}`
          }).join("\n")}`,
          components,
        });
      }
    } catch (e) {
      await interaction.deleteReply()
    }
  })
  .build()
