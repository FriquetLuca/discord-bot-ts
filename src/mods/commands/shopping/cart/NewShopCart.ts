import { ApplicationCommandOptionType, ApplicationCommandType, bold, italic } from "discord.js"
import { commandBuilder } from "@/libraries/discord/builders"
import { optionCommandBuilder } from "@/libraries/discord/builders/optionCommandBuilder"

export const NewShopCart = commandBuilder()
  .name("new-shop-cart")
  .description("Créer un nouveau caddie pour vos courses")
  .type(ApplicationCommandType.ChatInput)
  .addOption(
    optionCommandBuilder("label", ApplicationCommandOptionType.String)
    .required(true)
    .description("Le nom associé à votre nouveau caddie")
  )
  .handleCommand(async ({ interaction, prisma }) => {
    
    const currentLabel = interaction.options.get("label")?.value as string

    await interaction.deferReply()

    const newCart = await prisma.shoppingCart.create({
      data: {
        label: currentLabel
      }
    })

    await prisma.shoppingMember.create({
      data: {
        user_id: interaction.user.id,
        cart_id: newCart.id,
        permission: "OWNER",
      }
    })
    
    await interaction.followUp({
      content: `Votre caddie ${bold(newCart.label)} (${italic(`Hash: \`${newCart.id}\``)}) a été créé avec succès.`
    })

  })
  .build()
