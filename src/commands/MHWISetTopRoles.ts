import { ApplicationCommandOptionType, ApplicationCommandType, type HexColorString } from "discord.js"
import { builder } from "@/libraries/discord/builder"
import * as v from "@/libraries/discord/validators"

const colorRank = {
  'first': '#aadaf0',
  'second': '#ffd000',
  'third': '#e68b4b'
}

export const MHWISetTopRoles = builder
  .commandBuilder()
  .name("mhwi-set-top-roles")
  .description("Donnez des rôles aux trois meilleurs du classement")
  .type(ApplicationCommandType.ChatInput)
  .addOption(
    builder
      .optionCommandBuilder("first", ApplicationCommandOptionType.String)
      .description("Le nom du role du premier au classement")
      .required(true)
  )
  .addOption(
    builder
      .optionCommandBuilder("second", ApplicationCommandOptionType.String)
      .description("Le nom du role du second au classement")
      .required(true)
  )
  .addOption(
    builder
      .optionCommandBuilder("third", ApplicationCommandOptionType.String)
      .description("Le nom du role du troisième au classement")
      .required(true)
  )
  .handleCommand(async ({ interaction, prisma }) => {
    if(!interaction.guild) {
      await interaction.followUp({
        ephemeral: true,
        content: "Je suis navré, mais il m'est impossible de mettre des rôles entre nous..."
      })
      return
    }

    const currentRoles = await prisma.mHWITopRoles.findFirst({
      where: {
        guild_id: interaction.guild.id
      }
    })

    if(currentRoles) {
      const missing_roles: ('first' | 'second' | 'third')[] = []
      const r1 = await interaction.guild.roles.fetch(currentRoles.first_id)
      if(r1) {
        await r1.edit({
          name: v.validString(interaction, 'first') as string,
        })
      } else {
        missing_roles.push('first')
      }
      const r2 = await interaction.guild.roles.fetch(currentRoles.second_id)
      if(r2) {
        await r2.edit({
          name: v.validString(interaction, 'second') as string,
        })
      } else {
        missing_roles.push('second')
      }
      const r3 = await interaction.guild.roles.fetch(currentRoles.third_id)
      if(r3) {
        await r3.edit({
          name: v.validString(interaction, 'third') as string,
        })
      } else {
        missing_roles.push('third')
      }

      if(missing_roles.length > 0) {
        const remap = {
          first: "first_id" as "first_id",
          second: "second_id" as "second_id",
          third: "third_id" as "third_id"
        }
        const editing: {
          first_id?: string,
          second_id?: string,
          third_id?: string,
        } = {}
        for(const role of missing_roles) {
          const remappedRole = remap[role]
          const newRole = await interaction.guild.roles.create({
            name: v.validString(interaction, role) as string,
            color: colorRank[role] as HexColorString
          })
          editing[remappedRole] = newRole.id
        }
        await prisma.mHWITopRoles.update({
          where: {
            guild_id: interaction.guild.id,
          },
          data: editing
        })
      }

      await interaction.followUp({
        ephemeral: true,
        content: "Vous avez édité avec succès les rôles de votre leaderboard."
      })
    } else {
      const firstRole = await interaction.guild.roles.create({
        name: v.validString(interaction, 'first') as string,
        color: colorRank['first'] as HexColorString
      })
      const secondRole = await interaction.guild.roles.create({
        name: v.validString(interaction, 'second') as string,
        color: colorRank['second'] as HexColorString
      })
      const thirdRole = await interaction.guild.roles.create({
        name: v.validString(interaction, 'third') as string,
        color: colorRank['third'] as HexColorString
      })

      await prisma.mHWITopRoles.create({
        data: {
          guild_id: interaction.guild.id,
          first_id: firstRole.id,
          second_id: secondRole.id,
          third_id: thirdRole.id,
        }
      })

      await interaction.followUp({
        ephemeral: true,
        content: "Vous avez créer avec succès vos rôles pour votre leaderboard."
      })
    }
  })
  .build()