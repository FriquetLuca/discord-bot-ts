import { ActionRowBuilder, ApplicationCommandType, ButtonBuilder, ButtonStyle, bold, italic } from "discord.js"
import { commandBuilder } from "@/libraries/discord/builders"
import { findCurrentCartPage } from "@/database/shopping/findCurrentCartPage"
import { findCartCount } from "@/database/shopping/findCartCount"

export const MyShopCarts = commandBuilder()
  .name("my-shop-carts")
  .description("Retrouvez les caddies de vos courses")
  .type(ApplicationCommandType.ChatInput)
  .handleCommand(async ({ interaction, prisma }) => {
    const limit = 10
    let offset = 0
    const userId = interaction.user.id
    await interaction.deferReply()

    const cartList = await findCurrentCartPage({ prisma, userId, limit, offset, })
    const cartCount = Number(((await findCartCount({ prisma, userId, }))[0] ?? { count: BigInt(0) }).count)

    const previous = new ButtonBuilder()
			.setCustomId("previous")
			.setLabel('Précédent')
			.setStyle(ButtonStyle.Primary)

    const next = new ButtonBuilder()
      .setCustomId("next")
      .setLabel('Suivant')
      .setStyle(ButtonStyle.Primary)
    
    let hasInitialComponents = false
    const row = new ActionRowBuilder<ButtonBuilder>()
    if(offset !== 0) {
      row.addComponents(previous)
      hasInitialComponents = true
    }
    const isEnd = offset * limit + limit >= cartCount
    if(!isEnd) {
      row.addComponents(next)
      hasInitialComponents = true
    }

    const response = await interaction.followUp({
      content: `Tous vos caddies :\n${cartList.map(currentCart => {
        let updated = ""
        if(currentCart.updatedAt.getTime() !== currentCart.createdAt.getTime()) {
          updated = ` ${italic(`(modifié le ${currentCart.updatedAt.toLocaleDateString()} à ${currentCart.updatedAt.toLocaleTimeString()})`)}`
        }
        return `1. ${bold(currentCart.label)} (${italic(`Hash: \`${currentCart.cart_id}\``)}) créer le ${currentCart.createdAt.toLocaleDateString()} à ${currentCart.createdAt.toLocaleTimeString()}${updated}`
      }).join("\n")}`,
      components: hasInitialComponents ? [row] : [],
    })

    try {
      while(true) {
        const confirmation = await response.awaitMessageComponent({ filter: (i) => i.user.id === interaction.user.id, time: 180000 })
        if(confirmation.customId === "next") {
          offset++
        } else if(confirmation.customId === "previous") {
          offset--
        } else {
          return;
        }
        
        const cartList = await findCurrentCartPage({ prisma, userId, limit, offset, })
        const cartCount = Number(((await findCartCount({ prisma, userId, }))[0] ?? { count: BigInt(0) }).count)

        const previous = new ButtonBuilder()
          .setCustomId("previous")
          .setLabel('Précédent')
          .setStyle(ButtonStyle.Primary)

        const next = new ButtonBuilder()
          .setCustomId("next")
          .setLabel('Suivant')
          .setStyle(ButtonStyle.Primary)

        let hasComponents = false
        const row = new ActionRowBuilder<ButtonBuilder>()
        if(offset !== 0) {
          row.addComponents(previous)
          hasComponents = true
        }
        const isEnd = offset * limit + limit >= cartCount
        if(!isEnd) {
          row.addComponents(next)
          hasComponents = true
        }

        await confirmation.update({
          content: `Tous vos caddies :\n${cartList.map(currentCart => {
            let updated = ""
            if(currentCart.updatedAt.getTime() !== currentCart.createdAt.getTime()) {
              updated = ` ${italic(`(modifié le ${currentCart.updatedAt.toLocaleDateString()} à ${currentCart.updatedAt.toLocaleTimeString()})`)}`
            }
            return `1. ${bold(currentCart.label)} (${italic(`Hash: \`${currentCart.cart_id}\``)}) créer le ${currentCart.createdAt.toLocaleDateString()} à ${currentCart.createdAt.toLocaleTimeString()}${updated}`
          }).join("\n")}`,
          components: hasComponents ? [ row ] : [],
        });
      }
    } catch (e) {
      await interaction.deleteReply()
    }
  })
  .build()
