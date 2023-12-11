import { ApplicationCommandOptionType, ApplicationCommandType, bold, italic } from "discord.js"
import { commandBuilder } from "@/libraries/discord/builders"
import { optionCommandBuilder } from "@/libraries/discord/builders/optionCommandBuilder"

export const AddShopCartArticle = commandBuilder()
  .name("add-shop-cart-article")
  .description("Ajouter un article à votre caddie.")
  .type(ApplicationCommandType.ChatInput)
  .addOption(
    optionCommandBuilder("label", ApplicationCommandOptionType.String)
    .required(true)
    .description("Le nom associé à l'article")
  )
  .addOption(
    optionCommandBuilder("price", ApplicationCommandOptionType.String)
    .required(true)
    .description("Le prix de l'article")
  )
  .addOption(
    optionCommandBuilder("recipient", ApplicationCommandOptionType.User)
    .required(false)
    .description("La personne pour qui on achète l'article")
  )
  .handleCommand(async ({ interaction, prisma }) => {
    
    // const currentLabel = interaction.options.get("label")?.value as string

    // await interaction.deferReply()

    // const newCart = await prisma.shoppingCart.create({
    //   data: {
    //     label: currentLabel
    //   }
    // })

    // await prisma.shoppingMember.create({
    //   data: {
    //     user_id: interaction.user.id,
    //     cart_id: newCart.id,
    //     permission: "OWNER",
    //   }
    // })
    
    await interaction.followUp({
      content: `Not implemented yet...`
    })

  })
  .build()
