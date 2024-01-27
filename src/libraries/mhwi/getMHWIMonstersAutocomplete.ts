import { type AutocompleteInteraction, type Locale } from "discord.js";
import { MHWIMonsterSpecies, type MHWIMonsterStrength } from "@prisma/client";
import { getEnglishMHWIMonsterNames, getEnglishMHWIMonsterStrength, getFrenchMHWIMonsterNames, getFrenchMHWIMonsterStrength } from "@/libraries/mhwi";

export const generateLocalizedMonsterStrength = ({ locale, strength } : { locale: Locale, strength: MHWIMonsterStrength }) => {
  switch(locale) {
    case "fr":
      return getFrenchMHWIMonsterStrength(strength)
    default:
      return getEnglishMHWIMonsterStrength(strength)
  }
}

export const generateLocalizedMonsterName = ({ locale, monster } : { locale: Locale, monster: MHWIMonsterSpecies }) => {
  switch(locale) {
    case "fr":
      return getFrenchMHWIMonsterNames(monster)
    default:
      return getEnglishMHWIMonsterNames(monster)
  }
}

export async function getMHWIMonstersAutocomplete(interaction: AutocompleteInteraction) {
  const focusedValue = interaction.options.getFocused()
  const filtered = Object.getOwnPropertyNames(MHWIMonsterSpecies) // Get all monsters
    .map(name => ({
      name: generateLocalizedMonsterName({ locale: interaction.locale, monster: name as MHWIMonsterSpecies }),
      value: name
    }))
    .filter(monsters => monsters.name.toLowerCase().includes(focusedValue.toLowerCase()))
    .slice(0, 25)
  await interaction.respond(
    filtered,
  )
}
