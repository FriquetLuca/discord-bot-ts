import { AutocompleteInteraction } from "discord.js";
import { MHWIMonsterSpecies } from "@prisma/client";
import { getFrenchMHWIMonsterNames } from "@/libraries/mhwi";

export async function getMHWIMonstersAutocomplete(propertyName: string, interaction: AutocompleteInteraction) {
  const focusedValue = (interaction.options.get(propertyName)?.value ?? "").toString();
  const filtered = Object.getOwnPropertyNames(MHWIMonsterSpecies) // Get all monsters
    .map(name => ({
      name: getFrenchMHWIMonsterNames(name as MHWIMonsterSpecies),
      value: name
    })) // Translate their names
    .filter(monsters => monsters.name.toLowerCase().includes(focusedValue.toLowerCase())) // Filter on every monsters that could match the autocomplete
    .slice(0, 25) // Get the 20 first elements
  await interaction.respond(
    filtered,
  )
}