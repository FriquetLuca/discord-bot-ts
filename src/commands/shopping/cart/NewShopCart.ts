import { bold, italic } from "discord.js"
import { chatCommandBuilder } from "@/libraries/discord/builders"
import { validator } from "@/libraries/discord/validators"

export const NewShopCart = chatCommandBuilder()
  .setName("new-shop-cart")
  .setDescription("Créer un nouveau caddie pour vos courses")
  .addStringOption(option =>
    option.setName("label")
    .setRequired(true)
    .setDescription("Le nom associé à votre nouveau caddie")
  )
  .handleCommand(async ({ interaction, prisma }) => {
    
    const datas = validator(interaction)
      .string("label", true)
      .get()

    await interaction.deferReply()

    const newCart = await prisma.shoppingCart.create({
      data: datas
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
