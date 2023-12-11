import { ApplicationCommandOptionType, ApplicationCommandType, bold, italic } from "discord.js"
import { commandBuilder } from "@/libraries/discord/builders"
import { optionCommandBuilder } from "@/libraries/discord/builders/optionCommandBuilder"

export const SetShopCartContext = commandBuilder()
  .name("set-shop-cart-context")
  .description("Assigne le caddie contextuel au hash spécifié")
  .type(ApplicationCommandType.ChatInput)
  .addOption(
    optionCommandBuilder("hash", ApplicationCommandOptionType.String)
    .description("Le hash associé à votre caddie")
  )
  .handleCommand(async ({ interaction, prisma }) => {
    
    const currentHash = interaction.options.get("hash")?.value as string|undefined

    await interaction.deferReply()

    if(currentHash === undefined) {
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
            hash: currentHash,
          }
        })
        await interaction.followUp({
          content: `Le caddie contextuel est à présent indéfini.`
        })
        return
      }
      await interaction.followUp({
        content: `Error : Le caddie contextuel n'existe pas.`
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
            hash: currentHash,
          }
        })
      } else {
        await prisma.shoppingContext.create({
          data: {
            user_id: interaction.user.id,
            hash: currentHash,
          }
        })
      }
      await interaction.followUp({
        content: `Le caddie contextuel est à présent : ${bold(cart.cart.label)} (${italic(`Hash: \`${cart.cart.id}\``)}).`
      })
    } else {
      await interaction.followUp({
        content: `Erreur : Le caddie ${bold(currentHash)} n'existe pas.`
      })
    }
  })
  .build()
