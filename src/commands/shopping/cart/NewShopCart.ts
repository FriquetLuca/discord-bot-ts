import { bold, italic } from "discord.js"
import { chatCommandBuilder } from "@/libraries/discord/builders"

export const NewShopCart = chatCommandBuilder()
  .setName("new-shop-cart")
  .setDescription("Créer un nouveau caddie pour vos courses")
  .addStringOption(option =>
    option.setName("label")
    .setRequired(true)
    .setDescription("Le nom associé à votre nouveau caddie")
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
