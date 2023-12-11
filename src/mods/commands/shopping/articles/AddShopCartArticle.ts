import { chatCommandBuilder } from "@/libraries/discord/builders"

export const AddShopCartArticle = chatCommandBuilder()
  .setName("add-shop-cart-article")
  .setDescription("Ajouter un article à votre caddie.")
  .addStringOption(option =>
    option.setName("label")
    .setRequired(true)
    .setDescription("Le nom associé à l'article")
  )
  .addStringOption(option =>
    option.setName("price")
    .setRequired(true)
    .setDescription("Le prix de l'article")
  )
  .addUserOption(option =>
    option.setName("recipient")
    .setRequired(false)
    .setDescription("La personne pour qui on achète l'article")
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
