import { bold, italic } from "discord.js"
import { chatCommandBuilder } from "@/libraries/discord/builders"
import { validator } from "@/libraries/discord/validators"

export const SetShopCartContext = chatCommandBuilder()
  .setName("set-shop-cart-context")
  .setDescription("Assigne le caddie contextuel au hash spécifié")
  .addStringOption(option =>
    option.setName("hash")
      .setDescription("Le hash associé à votre caddie")
  )
  .handleCommand(async ({ interaction, prisma }) => {
    
    const datas = validator(interaction)
      .string("hash")
      .get()

    await interaction.deferReply()

    if(datas.hash === undefined) {
      const shopContext = await prisma.shoppingContext.findUnique({
        where: {
          user_id: interaction.user.id,
        }
      })
      if(shopContext !== null) {
        await prisma.shoppingContext.update({
          where: {
            user_id: interaction.user.id,
          },
          data: {
            hash: undefined,
          }
        })
        await interaction.followUp({
          content: `Le caddie contextuel est à présent indéfini.`
        })
        return
      }
      await interaction.followUp({
        content: `Erreur : Le caddie contextuel n'existe pas.`
      })
      return
    }

    const cart = await prisma.shoppingMember.findFirst({
      where: {
        user_id: interaction.user.id
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
      const userCtx = await prisma.shoppingContext.findUnique({
        where: {
          user_id: interaction.user.id
        }
      })
  
      if(userCtx !== null) {
        await prisma.shoppingContext.update({
          where: {
            user_id: interaction.user.id,
          },
          data: {
            hash: datas.hash,
          }
        })
      } else {
        await prisma.shoppingContext.create({
          data: {
            user_id: interaction.user.id,
            hash: datas.hash,
          }
        })
      }
      await interaction.followUp({
        content: `Le caddie contextuel est à présent : ${bold(cart.cart.label)} (${italic(`Hash: \`${cart.cart.id}\``)}).`
      })
    } else {
      await interaction.followUp({
        content: `Erreur : Le caddie ${bold(datas.hash)} n'existe pas.`
      })
    }
  })
  .build()
