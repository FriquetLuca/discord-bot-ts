import { type MonsterRecord, missingMonsters, searchAllMonsterKills, toPercent } from "@/database/mhwi"
import { chatCommandBuilder } from "@/libraries/discord/builders"
import { validString, validator } from "@/libraries/discord/validators"
import { stringifyJSON } from "@/libraries/json"
import { getEnglishMHWIMonsterNames, getEnglishMHWIMonsterStrength, getFrenchMHWIMonsterNames, getFrenchMHWIMonsterStrength, getMHWIMonstersAutocomplete, getNextRankExp, getRank, getRankExp, getRanks, getRawHunterRank, monsterRank } from "@/libraries/mhwi"
import { fromRecords } from "@/libraries/sqeul"
import { getTimestamp, parseTime } from "@/libraries/time"
import { MHWIHuntCategory, MHWIMonsterSpecies, MHWIMonsterStrength, type PrismaClient } from "@prisma/client"
import { type CacheType, type ChatInputCommandInteraction, SlashCommandBuilder, bold, type Locale, userMention, type AutocompleteFocusedOption } from "discord.js"

type DatabaseSoloMonsterRecord = {
  id: string
  kill_time: bigint
  category: MHWIHuntCategory
  monster: MHWIMonsterSpecies
  strength: MHWIMonsterStrength
  members?: undefined
}

type DatabaseTeamMonsterRecord = {
  id: string
  kill_time: bigint
  category: MHWIHuntCategory
  monster: MHWIMonsterSpecies
  strength: MHWIMonsterStrength
  members: {
    user_id: string
  }[]
}

const getMonsterRecordsByCategory = async ({ prisma, user_id, category }: {prisma: PrismaClient, user_id: string, category?: "Freestyle" | "Capture" | "Gladiator"}) => {
  const solo = await prisma.mHWIMonsterKill.findMany({
    where: {
      user_id,
      category,
    },
    select: {
      id: true,
      monster: true,
      strength: true,
      category: true,
      kill_time: true,
    }
  }) as DatabaseSoloMonsterRecord[]

  const team = await prisma.mHWIMonsterKillTeam.findMany({
    where: {
      category,
      members: {
        some: {
          user_id,
        }
      }
    },
    select: {
      id: true,
      monster: true,
      strength: true,
      category: true,
      kill_time: true,
      members: {
        select: {
          user_id: true,
        },
        where: {
          user_id: {
            notIn: [ user_id ]
          }
        }
      }
    }
  }) as DatabaseTeamMonsterRecord[]
  
  return {
    solo,
    team
  }
}

const groupMonsterRecordsByMonsterAndStrength = <T extends DatabaseSoloMonsterRecord | DatabaseTeamMonsterRecord>({ records }: { records: T[] }) => {
  const groupBy = new Map<string, T & {
    count: number
    total_time: bigint
  }>()

  for(const hunt of records) {
    const id = `${hunt.monster}-${hunt.strength}`
    if(groupBy.has(id)) {
      const record = groupBy.get(id)!
      if(hunt.kill_time < record.kill_time) {
        groupBy.set(id, {
          ...hunt,
          count: record.count + 1,
          total_time: record.total_time + hunt.kill_time,
        })
      } else {
        groupBy.set(id, {
          ...record,
          count: record.count + 1,
          total_time: record.total_time + hunt.kill_time,
        })
      }
    } else {
      groupBy.set(id, {
        id: hunt.id,
        kill_time: hunt.kill_time,
        category: hunt.category,
        monster: hunt.monster,
        strength: hunt.strength,
        count: 1,
        total_time: hunt.kill_time,
        members: hunt.members,
      } as any)
    }
  }
  return groupBy
}
const findEncounteredMonsters = (monsters: MonsterRecord[], records: (DatabaseSoloMonsterRecord | DatabaseTeamMonsterRecord)[], category?: "Freestyle" | "Gladiator" | "Capture") => fromRecords(monsters)
  .filter((record) => {
    if(category === "Capture") {
      if((record as { uncapturable?: boolean }).uncapturable ?? false) {
        return false
      }
    }
    if(category === "Gladiator") {
      if((record as { siege?: boolean }).siege ?? false) {
        return false
      }
    }
    for(const rec of records) {
      if(category !== undefined && rec.category !== category) {
        continue
      }
      if(rec.monster === record.monster && rec.strength === record.strength) {
        return true
      }
    }
    return false
  })
  .get()

const findNotEncounteredMonsters = (monsters: MonsterRecord[], records: (DatabaseSoloMonsterRecord | DatabaseTeamMonsterRecord)[], category?: "Freestyle" | "Gladiator" | "Capture") => fromRecords(monsters)
  .filter((record) => {
    if(category === "Capture") {
      if((record as { uncapturable?: boolean }).uncapturable ?? false) {
        return false
      }
    }
    if(category === "Gladiator") {
      if((record as { siege?: boolean }).siege ?? false) {
        return false
      }
    }
    for(const rec of records) {
      if(category !== undefined && rec.category !== category) {
        continue
      }
      if(rec.monster === record.monster && rec.strength === record.strength) {
        return false
      }
    }
    return true
  })
  .get()

const findEncounteredMonsterRecords = (monsters: MonsterRecord[], records: MonsterRecord[], category?: "Freestyle" | "Gladiator" | "Capture") => fromRecords(monsters)
  .filter((record) => {
    if(category === "Capture") {
      if(record?.uncapturable ?? false) {
        return false
      }
    }
    if(category === "Gladiator") {
      if(record?.siege ?? false) {
        return false
      }
    }
    for(const rec of records) {
      if(rec.monster === record.monster && rec.strength === record.strength) {
        return true
      }
    }
    return false
  })
  .get()

const generateRecordID = <T extends Record<string, any>, U extends string[]>(record: T[Extract<keyof T, string>], ...keys: U) => keys
  .map(key => stringifyJSON(record[key])).join("-")

const recordsGroupedBy = <T extends Record<string, any>, U extends string[]>(records: T, ...keys: U) => {
  const groupBy = new Map<string, T[]>()
  for(const recordName in records) {
    const currRecord = records[recordName]
    const currentKeys = keys.filter(key => Object.hasOwn(currRecord, key))
    if(currentKeys.length !== keys.length) {
      continue
    }
    const id = generateRecordID(currRecord, ...currentKeys)
    if(groupBy.has(id)) {
      const records = groupBy.get(id)!
      groupBy.set(id, [ ...records, currRecord ])
    } else {
      groupBy.set(id, [ currRecord ])
    }
  }
  return Array.from(groupBy.entries())
}

const allMonsters = fromRecords(monsterRank.A)
  .union(monsterRank.B)
  .union(monsterRank.C)
  .union(monsterRank.D)
  .union(monsterRank.E)
  .union(monsterRank.F)
  .union(monsterRank.S)
  .union(monsterRank.SS)
  .union(monsterRank.SSS)
  .get()

const allRanks = [ "SSS" as "SSS", "SS" as "SS", "S" as "S", "A" as "A", "B" as "B", "C" as "C", "D" as "D", "E" as "E", "F" as "F" ]

type ExtractTuple<T> = T extends (infer U)[] ? U : T

const findMissingMonsters = async (currentData: {
  prisma: PrismaClient
  user_id: string
}) => {
  const allKills = await searchAllMonsterKills(currentData)
  return missingMonsters(allKills, allMonsters)
}

const errors: Record<string, Record<string, string>> = {
  monster: {
    fr: "Le monstre spécifié n'existe pas"
  },
  strength: {
    fr: "La force du monstre spécifié n'existe pas"
  },
  time: {
    fr: "Le temps est requis pour enregistrer la chasse"
  },
  refinedTime: {
    fr: "Votre temps n'est pas écrit dans un format de temps valide"
  }
}

const localizedCategory = (category: "Freestyle" | "Capture" | "Gladiator", locale: Locale) => {
  switch(locale) {
    case "fr":
      return category === "Freestyle" ? "Libre" : category === "Gladiator" ? "Gladiateur" : category
    default:
      return category
  }
}

const subCommandList: {
  name: string,
  execute: ({ interaction, prisma }: { interaction: ChatInputCommandInteraction<CacheType>, prisma: PrismaClient }) => Promise<void>
}[] = [
  {
    name: "rank",
    execute: async ({ interaction, prisma }) => {

      const locale = interaction.locale

      const data = validator(interaction)
        .in("rank", { SSS: "SSS", SS: "SS", S: "S", A: "A", B: "B", C: "C", D: "D", E: "E", F: "F" }, true)
        .in("category", { Freestyle: "Freestyle", Capture: "Capture", Gladiator: "Gladiator" })
        .get()
      
      await interaction.deferReply()

      const monsters = await getMonsterRecordsByCategory({
        prisma,
        user_id: interaction.user.id,
        category: data.category
      })

      const currentRankMonsters = monsterRank[data.rank]
      
      const soloHunts = fromRecords(monsters.solo)
        .filter((record) => {
          for(const rec of currentRankMonsters) {
            if(rec.monster === record.monster && rec.strength === record.strength) {
              return true
            }
          }
          return false
        })
        .get()

      const teamHunts = fromRecords(monsters.team)
        .filter((record) => {
          for(const rec of currentRankMonsters) {
            if(rec.monster === record.monster && rec.strength === record.strength) {
              return true
            }
          }
          return false
        })
        .get()
        
      const allHunts = fromRecords(soloHunts)
        .union(teamHunts)
        .get()

      const monstersNotEncountered = findNotEncounteredMonsters(currentRankMonsters, allHunts, data.category)
      
      const soloMonstersTotalTime = soloHunts.reduce((p, c) => c.kill_time + p, BigInt(0))
      const teamMonstersTotalTime = teamHunts.reduce((p, c) => c.kill_time + p, BigInt(0))
      const killedMonstersTotalTime = allHunts.reduce((p, c) => c.kill_time + p, BigInt(0))

      const avgTimeTimestamp = getTimestamp(killedMonstersTotalTime === BigInt(0) ? BigInt(0) : killedMonstersTotalTime / BigInt(allHunts.length))
      const avgSoloTimeTimestamp = getTimestamp(soloMonstersTotalTime === BigInt(0) ? BigInt(0) : soloMonstersTotalTime / BigInt(soloHunts.length))
      const avgTeamTimeTimestamp = getTimestamp(teamMonstersTotalTime === BigInt(0) ? BigInt(0) : teamMonstersTotalTime / BigInt(teamHunts.length))
      
      const totalTimeTimestamp = getTimestamp(killedMonstersTotalTime)
      const totalsoloTimeTimestamp = getTimestamp(soloMonstersTotalTime)
      const totalteamTimeTimestamp = getTimestamp(teamMonstersTotalTime)

      const currentRank = getRank(data.rank, interaction.guildId ?? "")

      const allMonstersInRankCount = monsterRank[data.rank].length

      const contentReply: string[] = []
      contentReply.push(`Votre progression ${bold(currentRank)} (${allMonstersInRankCount - monstersNotEncountered.length} / ${allMonstersInRankCount})${data.category === undefined ? "" : ` [${localizedCategory(data.category, locale)}]`}`)

      if(allHunts.length > 0) {

        contentReply.push("")
        contentReply.push(`- ${bold("Temps total")} : ${bold(totalTimeTimestamp)}`)
        if(soloHunts.length > 0) {
          contentReply.push(`- ${bold("Temps total en solo")} : ${bold(totalsoloTimeTimestamp)}`)
        }
        if(teamHunts.length > 0) {
          contentReply.push(`- ${bold("Temps total en équipe")} : ${bold(totalteamTimeTimestamp)}`)
        }
        contentReply.push("")
        contentReply.push(`- ${bold("Temps moyen par monstre")} : ${bold(avgTimeTimestamp)}`)
        if(soloHunts.length > 0) {
          contentReply.push(`- ${bold("Temps moyen par monstre en solo")} : ${bold(avgSoloTimeTimestamp)}`)
        }
        if(teamHunts.length > 0) {
          contentReply.push(`- ${bold("Temps moyen par monstre en équipe")} : ${bold(avgTeamTimeTimestamp)}`)
        }
      }
      contentReply.push("")
      if(monstersNotEncountered.length > 0) {
        contentReply.push(`${bold("Monstres restants")} :`)
        contentReply.push(monstersNotEncountered.map(v => `1. ${getFrenchMHWIMonsterNames(v.monster)} (${getFrenchMHWIMonsterStrength(v.strength)})`).join("\n"))
      } else {
        contentReply.push(`${bold("Ce rang a été validé avec succès !")}`)
      }
      
      await interaction.followUp({
        content: contentReply.join("\n")
      })
    }
  },
  {
    name: "score-rank",
    execute: async ({ interaction, prisma }) => {

      const locale = interaction.locale

      const data = validator(interaction)
        .in("rank", { SSS: "SSS", SS: "SS", S: "S", A: "A", B: "B", C: "C", D: "D", E: "E", F: "F" }, true)
        .in("category", { Freestyle: "Freestyle", Capture: "Capture", Gladiator: "Gladiator" })
        .get()

      const currentRankMonsters = monsterRank[data.rank]
      
      await interaction.deferReply()

      const monsters = await getMonsterRecordsByCategory({
        prisma,
        user_id: interaction.user.id,
        category: data.category
      })
      
      const soloHunts = fromRecords(monsters.solo)
        .filter((record) => {
          for(const rec of currentRankMonsters) {
            if(rec.monster === record.monster && rec.strength === record.strength) {
              return true
            }
          }
          return false
        })
        .get() as DatabaseSoloMonsterRecord[]

      const hashmapSolo = groupMonsterRecordsByMonsterAndStrength({
        records: soloHunts
      })

      const teamHunts = fromRecords(monsters.team)
        .filter((record) => {
          for(const rec of currentRankMonsters) {
            if(rec.monster === record.monster && rec.strength === record.strength) {
              return true
            }
          }
          return false
        })
        .get() as DatabaseTeamMonsterRecord[]

      const hashmapTeam = groupMonsterRecordsByMonsterAndStrength({
        records: teamHunts
      })

      const allHunts = fromRecords(soloHunts)
        .union(teamHunts)
        .get()
      
      const monstersNotEncountered = findNotEncounteredMonsters(currentRankMonsters, allHunts, data.category)

      const hashmapAll = groupMonsterRecordsByMonsterAndStrength({
        records: allHunts
      })

      const aggregateSoloHunts = Array.from(hashmapSolo.entries()).map(([_, value]) => value)
      const aggregateTeamHunts = Array.from(hashmapTeam.entries()).map(([_, value]) => value)
      const aggregateAllHunts = Array.from(hashmapAll.entries()).map(([_, value]) => value)
              
      const soloMonstersTotalTime = aggregateSoloHunts.reduce((p, c) => c.kill_time + p, BigInt(0))
      const teamMonstersTotalTime = aggregateTeamHunts.reduce((p, c) => c.kill_time + p, BigInt(0))
      const killedMonstersTotalTime = aggregateAllHunts.reduce((p, c) => c.kill_time + p, BigInt(0))

      const avgTimeTimestamp = getTimestamp(killedMonstersTotalTime === BigInt(0) ? BigInt(0) : killedMonstersTotalTime / BigInt(aggregateAllHunts.length))
      const avgSoloTimeTimestamp = getTimestamp(soloMonstersTotalTime === BigInt(0) ? BigInt(0) : soloMonstersTotalTime / BigInt(aggregateSoloHunts.length))
      const avgTeamTimeTimestamp = getTimestamp(teamMonstersTotalTime === BigInt(0) ? BigInt(0) : teamMonstersTotalTime / BigInt(aggregateTeamHunts.length))
      

      const currentRank = getRank(data.rank, interaction.guildId ?? "")

      const contentReply: string[] = []
      contentReply.push(`Vos scores du rang ${bold(currentRank)} (${aggregateAllHunts.length} / ${monstersNotEncountered.length + aggregateAllHunts.length})${data.category === undefined ? "" : ` [${localizedCategory(data.category, locale)}]`}`)

      contentReply.push("")
      const totalTimeTimestamp = getTimestamp(killedMonstersTotalTime)
      contentReply.push(`- ${bold("Temps total")} : ${bold(totalTimeTimestamp)}`)
      if(soloHunts.length > 0) {
        const totalsoloTimeTimestamp = getTimestamp(soloMonstersTotalTime)
        contentReply.push(`- ${bold("Temps total en solo")} : ${bold(totalsoloTimeTimestamp)}`)
      }
      if(teamHunts.length > 0) {
        const totalteamTimeTimestamp = getTimestamp(teamMonstersTotalTime)
        contentReply.push(`- ${bold("Temps total en équipe")} : ${bold(totalteamTimeTimestamp)}`)
      }
      contentReply.push("")
      contentReply.push(`- ${bold("Temps moyen par monstre")} : ${bold(avgTimeTimestamp)}`)
      if(soloHunts.length > 0) {
        contentReply.push(`- ${bold("Temps moyen par monstre en solo")} : ${bold(avgSoloTimeTimestamp)}`)
      }
      if(teamHunts.length > 0) {
        contentReply.push(`- ${bold("Temps moyen par monstre en équipe")} : ${bold(avgTeamTimeTimestamp)}`)
      }
      await interaction.followUp({
        content: contentReply.join("\n")
      })
      if(aggregateAllHunts.length > 0) {
        const contentReply = [] as (string)[]
        let result: string[] = []
        result.push(`${bold("Vos scores")} :\n`)
        for(let i = 0; i < aggregateAllHunts.length; i++) {
          if(i > 0 && i % 10 === 0) {
            contentReply.push(result.join("\n"))
            result = [ `${bold("Vos scores")} :\n` ]
          }
          const v = aggregateAllHunts[i]
          result.push(`${i + 1}. ${getFrenchMHWIMonsterNames(v.monster)} (${getFrenchMHWIMonsterStrength(v.strength)})`)
          result.push(`  - Chassés : ${v.count}`)
          const solo_monster = hashmapSolo.get(`${v.monster}-${v.strength}`)
          if(solo_monster !== undefined) {
            result.push(`  - Top solo : ${bold(getTimestamp(solo_monster.kill_time))} (${bold(getTimestamp(solo_monster.total_time / BigInt(solo_monster.count)))} / monstre)`)
          }
          const team_monster = hashmapTeam.get(`${v.monster}-${v.strength}`)
          if(team_monster !== undefined) {
            result.push(`  - Top équipe : ${bold(getTimestamp(team_monster.kill_time))}${team_monster.members === undefined ? "" : team_monster.members.length === 0 ? "" : ` avec ${team_monster.members.map(user => userMention(user.user_id)).join(", ")}`} (${bold(getTimestamp(team_monster.total_time / BigInt(team_monster.count)))} / monstre)`)
          }
          contentReply
        }
        if(result.length > 0) {
          contentReply.push(result.join("\n"))
        }
        contentReply.forEach((reply, i) => setTimeout(async () => {
          await interaction.followUp({
            content: reply
          })
        }, (i + 1) * 100))
      }
    }
  },
  {
    name: "post-solo-hunt",
    execute: async ({ interaction, prisma }) => {

      const locale = interaction.locale
      
      const datas = validator(interaction)
        .in("monster", MHWIMonsterSpecies, true, errors.monster[locale] ?? "The specified monster doesn't exist")
        .in("strength", MHWIMonsterStrength, true, errors.strength[locale] ?? "The specified monster's strength doesn't exist")
        .string("time", true, errors.time[locale] ?? "The time is required to register the hunt")
        .refine(e => {
          const t = parseTime(e.time)
          if(t === null || Number.isNaN(t)) {
            throw new Error(errors.refinedTime[locale] ?? "Your time isn't written in a valid time format")
          }
          return ({ ...e, time: BigInt(t) })
        })
        .in("category", { Freestyle: "Freestyle", Capture: "Capture", Gladiator: "Gladiator" }, true)
        .get()

      await interaction.deferReply()

      const newHunt = await prisma.mHWIMonsterKill.create({
        data: {
          user_id: interaction.user.id,
          kill_time: datas.time,
          monster: datas.monster,
          strength: datas.strength,
          category: datas.category
        }
      })
      
      const generateLocalized = (locale: Locale) => {
        switch(locale) {
          case "fr":
            return `Votre ${bold(`${getFrenchMHWIMonsterNames(newHunt.monster)} ${getFrenchMHWIMonsterStrength(newHunt.strength)}`)} [Hash: \`${newHunt.id}\`] en solo a bien été enregistré`
          default:
            return `Your ${bold(`${getEnglishMHWIMonsterStrength(newHunt.strength)} ${getEnglishMHWIMonsterNames(newHunt.monster)}`)} [Hash: \`${newHunt.id}\`] has been saved`
        }
      }
      await interaction.followUp({
        content: generateLocalized(locale)
      })
    }
  },
  {
    name: "post-team-hunt",
    execute: async ({ interaction, prisma }) => {
      const locale = interaction.locale

      const players = [...new Set([
        interaction.user.id,
        validString(interaction, 'player2'),
        validString(interaction, 'player3'),
        validString(interaction, 'player4')
      ].filter(item => item !== undefined) as string[])]
      
      const datas = validator(interaction)
        .in("monster", MHWIMonsterSpecies, true, errors.monster[locale] ?? "The specified monster doesn't exist")
        .in("strength", MHWIMonsterStrength, true, errors.strength[locale] ?? "The specified monster's strength doesn't exist")
        .string("time", true, errors.time[locale] ?? "The time is required to register the hunt")
        .refine(e => {
          const t = parseTime(e.time)
          if(t === null || Number.isNaN(t)) {
            throw new Error(errors.refinedTime[locale] ?? "Your time isn't written in a valid time format")
          }
          return ({ ...e, time: BigInt(t) })
        })
        .in("category", { Freestyle: "Freestyle", Capture: "Capture", Gladiator: "Gladiator" }, true)
        .get()
      
      await interaction.deferReply()

      const newHunt = await prisma.mHWIMonsterKillTeam.create({
        data: {
          kill_time: datas.time,
          monster: datas.monster,
          strength: datas.strength,
          category: datas.category
        }
      })

      players.forEach(async (player) => {
        if(!prisma) return
        await prisma.mHWITeamMembers.create({
          data: {
            user_id: player,
            monsterKillTeamId: newHunt.id
          }
        })
      })

      const teamMembers = players.filter(p => p !== interaction.user.id)

      const generateLocalized = (locale: Locale) => {
        switch(locale) {
          case "fr":
            return `Votre ${bold(`${getFrenchMHWIMonsterNames(newHunt.monster)} ${getFrenchMHWIMonsterStrength(newHunt.strength)}`)} [Hash: \`${newHunt.id}\`] en équipe${teamMembers.length > 0 ? ` avec ${teamMembers.map(member => bold(userMention(member))).join(", ")}` : ""} a bien été enregistré`
          default:
            return `Your ${bold(`${getEnglishMHWIMonsterStrength(newHunt.strength)} ${getEnglishMHWIMonsterNames(newHunt.monster)}`)} [Hash: \`${newHunt.id}\`] in team${teamMembers.length > 0 ? ` with ${teamMembers.map(member => bold(userMention(member))).join(", ")}` : ""} has been saved`
        }
      }
      
      await interaction.followUp({
        content: generateLocalized(locale)
      })
    }
  },
  {
    name: "random-monster",
    execute: async ({ interaction, prisma }) => {
      const data = validator(interaction)
        .bool("only-missing")
        .in("rank", { SSS: "SSS", SS: "SS", S: "S", A: "A", B: "B", C: "C", D: "D", E: "E", F: "F" })
        .get()
      const locale = interaction.locale

      if(data.rank !== undefined) {

        const getMissingChoice = async (rank: ExtractTuple<typeof allRanks>) => {
          if(data["only-missing"] !== true) {
            return allMonsters
          }
          const allKills = await searchAllMonsterKills({
            prisma,
            user_id: interaction.user.id
          })
          return missingMonsters(allKills, monsterRank[rank] as typeof allMonsters)
        }

        const missing = await getMissingChoice(data.rank)

        if(missing.length === 0) {
          const generateLocalized = (locale: Locale, rank: "SSS" | "SS" | "S" | "A" | "B" | "C" | "D" | "E" | "F") => {
            switch(locale) {
              case "fr":
                return `Vous avez déjà chassé tous les monstres de la liste de rang ${bold(getRank(rank, interaction.guildId ?? ""))} au moins une fois`
              default:
                return `You've already hunted every monsters in the ${bold(getRank(rank, interaction.guildId ?? ""))} rank list at least once`
            }
          }
          await interaction.reply({
            content: generateLocalized(locale, data.rank)
          })
          return
        }

        const rnd_monster = missing[Math.floor(Math.random() * missing.length)]
        const generateLocalized = (locale: Locale) => {
          switch(locale) {
            case "fr":
              return `Affrontez un ${bold(getFrenchMHWIMonsterNames(rnd_monster.monster))} en ${bold(getFrenchMHWIMonsterStrength(rnd_monster.strength))}`
            default:
              return `Hunt an ${bold(getEnglishMHWIMonsterStrength(rnd_monster.strength))} ${bold(getEnglishMHWIMonsterNames(rnd_monster.monster))}`
          }
        }
        await interaction.reply({
          content: generateLocalized(locale)
        })
      } else {
        const getMissingChoice = async () => data["only-missing"] !== true ? allMonsters : await findMissingMonsters({
          prisma,
          user_id: interaction.user.id
        })
        const missing = await getMissingChoice()
        if(missing.length === 0) {
          const generateLocalized = (locale: Locale) => {
            switch(locale) {
              case "fr":
                return `Vous avez déjà chassé tous les monstres au moins une fois`
              default:
                return `You've already hunted every monsters at least once`
            }
          }
          await interaction.reply({
            content: generateLocalized(locale)
          })
          return
        }
        const rnd_monster = missing[Math.floor(Math.random() * missing.length)]
        const generateLocalized = (locale: Locale) => {
          switch(locale) {
            case "fr":
              return `Affrontez un ${bold(getFrenchMHWIMonsterNames(rnd_monster.monster))} en ${bold(getFrenchMHWIMonsterStrength(rnd_monster.strength))}`
            default:
              return `Hunt an ${bold(getEnglishMHWIMonsterStrength(rnd_monster.strength))} ${bold(getEnglishMHWIMonsterNames(rnd_monster.monster))}`
          }
        }
        await interaction.reply({
          content: generateLocalized(locale)
        })
      }
    
        
    }
  },
  {
    name: "remove-hunt",
    execute: async ({ interaction, prisma }) => {
      const data = validator(interaction)
        .bool("in-team", true)
        .string("hash", true)
        .get()
      
      const locale = interaction.locale

      await interaction.deferReply()

      if(data["in-team"]) {
        const allRecords = await prisma.mHWIMonsterKillTeam.findMany({
          where: {
            id: data.hash,
            members: {
              some: {
                user_id: interaction.user.id
              }
            }
          },
          select: {
            id: true,
            members: {
              select: {
                user_id: true
              }
            }
          }
        })
        for(const record of allRecords) {
          if(record.members.length > 1) {
            await prisma.mHWITeamMembers.deleteMany({
              where: {
                user_id: interaction.user.id,
                monsterKillTeamId: record.id
              }
            })
          } else {
            await prisma.mHWIMonsterKillTeam.delete({
              where: {
                id: record.id
              }
            })
          }
        }
      } else {
        await prisma.mHWIMonsterKill.deleteMany({
          where: {
            id: data.hash,
            user_id: interaction.user.id,
          }
        })
      }
      const generateLocalized = (locale: Locale) => {
        switch(locale) {
          case "fr":
            return "Votre chasse a été correctement supprimée"
          default:
            return "Your hunt has been correctly removed"
        }
      }
      await interaction.followUp({
        content: generateLocalized(locale)
      })
    }
  },
  {
    name: "my-rank",
    execute: async ({ interaction, prisma }) => {

      const locale = interaction.locale

      const data = validator(interaction)
        .in("category", { Freestyle: "Freestyle", Capture: "Capture", Gladiator: "Gladiator" })
        .get()

      await interaction.deferReply()

      const monsters = await getMonsterRecordsByCategory({
        prisma,
        user_id: interaction.user.id,
        category: data.category
      })

      const allHunts = fromRecords(monsters.solo)
        .union(monsters.team)
        .get()

      const monstersNotEncountered = findNotEncounteredMonsters(allMonsters, allHunts, data.category)
      const monstersEncountered = findEncounteredMonsters(allMonsters, allHunts, data.category)

      const hashmapAll = groupMonsterRecordsByMonsterAndStrength({
        records: allHunts
      })
      
      const rankingMonsters = allRanks.map(rank => {
        const currentRankMonsters = monsterRank[rank]
        const encounters = findEncounteredMonsters(currentRankMonsters, allHunts, data.category)
        const unencounters = findNotEncounteredMonsters(currentRankMonsters, allHunts, data.category)
        const timer = encounters.map((v) => hashmapAll.get(`${v.monster}-${v.strength}`)!).reduce((acc, curr) => ({
          count: acc.count + curr.count,
          time: acc.time + curr.kill_time,
        }), { count: 0, time: BigInt(0) })
        const difficulty = Math.pow(2, allRanks.length - (allRanks.findIndex((v) => rank === v) + 1))
        return {
          rank,
          timer: {
            ...timer,
            average: timer.count > 0 ? timer.time / BigInt(timer.count) : BigInt(0),
          },
          encountered: encounters.length,
          notEncountered: unencounters.length,
          points: difficulty * encounters.length,
          maxPoints: difficulty * (encounters.length + unencounters.length)
        }
      })

      const currentExp = rankingMonsters.reduce((p, c) => p + c.points, 0)
      const maxExp = rankingMonsters.reduce((p, c) => p + c.maxPoints, 0)
      const hunterRank = getRawHunterRank(currentExp)
      const currentRankExp = getRankExp(hunterRank)
      const nextRankExp = getNextRankExp(hunterRank)
      const serverId = interaction.guildId ?? ""

      const result: string[] = []
      if(data.category) {
        result.push(`${bold("Votre progrès")} (${localizedCategory(data.category, locale)})`)
      } else {
        result.push(`${bold("Votre progrès")}`)
      }
      result.push("")
      result.push(bold(`Rang ${getRank(hunterRank, serverId)}`))
      result.push(`${bold("Monstres chassés")} : ${bold(monstersEncountered.length.toString())} / ${bold((monstersEncountered.length + monstersNotEncountered.length).toString())} (${toPercent(monstersEncountered.length / (monstersEncountered.length + monstersNotEncountered.length))}%)`)
      result.push(`${bold("Expérience")} : ${bold((currentExp - currentRankExp).toString())} / ${bold((nextRankExp - currentRankExp).toString())} (${toPercent((currentExp - currentRankExp) / (nextRankExp - currentRankExp))}%)`)
      result.push(`${bold("Expérience totale")} : ${bold(currentExp.toString())} / ${bold(maxExp.toString())} (${toPercent(currentExp / maxExp)}%)`)
      result.push("")
      result.push(`${bold("Monstres")} :`)
      const soloTime = monsters.solo.reduce((p, c) => p + c.kill_time, BigInt(0))
      result.push(`- ${bold("Solo")} :`)
      result.push(`  - ${bold("Monstres chassés")} : ${bold(monsters.solo.length.toString())}`)
      result.push(`  - ${bold("Temps par monstre")} : ${monsters.solo.length === 0 ? bold(getTimestamp(BigInt(monsters.solo.length))) : bold(getTimestamp(soloTime / BigInt(monsters.solo.length)))}`)
      result.push(`  - ${bold("Temps total")} : ${bold(getTimestamp(soloTime))}`)
      const teamTime = monsters.team.reduce((p, c) => p + c.kill_time, BigInt(0))
      result.push(`- ${bold("Équipe")} :`)
      result.push(`  - ${bold("Monstres chassés")} : ${bold(monsters.team.length.toString())}`)
      result.push(`  - ${bold("Temps par monstre")} : ${monsters.team.length === 0 ? bold(getTimestamp(BigInt(monsters.team.length))) : bold(getTimestamp(teamTime / BigInt(monsters.team.length)))}`)
      result.push(`  - ${bold("Temps total")} : ${bold(getTimestamp(teamTime))}`)
      result.push(`- ${bold("Total")} :`)
      result.push(`  - ${bold("Monstres chassés")} : ${bold(allHunts.length.toString())}`)
      result.push(`  - ${bold("Temps par monstre")} : ${allHunts.length === 0 ? bold(getTimestamp(BigInt(allHunts.length))) : bold(getTimestamp((soloTime + teamTime) / BigInt(allHunts.length)))}`)
      result.push(`  - ${bold("Temps total")} : ${bold(getTimestamp(soloTime + teamTime))}`)
      result.push("")
      const rankingText = rankingMonsters.map(rank => {
        const result = [
          `${bold(`Rang ${getRank(rank.rank, serverId)}`)} :`
        ]
        if(rank.notEncountered > 0) {
          result.push(`- Progression : ${rank.encountered} / ${rank.encountered + rank.notEncountered} (${toPercent(rank.encountered / (rank.encountered + rank.notEncountered))}%)`)
          result.push(`- Monstres restant : ${rank.notEncountered}`)
        }
        if(rank.notEncountered === 0) {
          result.push(`- Rang faisable en : ${bold(getTimestamp(rank.timer.time))} (${bold(getTimestamp(rank.timer.average))} / monstre)`)
        }
        return result.join("\n")
      })
      result.push(...rankingText)

      await interaction.followUp({
        content: result.join("\n")
      })
    }
  }
]

const baseCommand = chatCommandBuilder()
  .setName("x")
  .setDescription("x")
  .handleCommand(async ({ interaction, prisma }) => {
    const subcommands = subCommandList.filter(subcommand => interaction.options.getSubcommand() === subcommand.name)
    for(const subcommand of subcommands) {
      subcommand.execute({ interaction, prisma })
    }
  })
  .autocomplete(async ({ interaction }) => {
    const focusedValue = interaction.options.getFocused(true)
    switch(focusedValue.name) {
      case "rank":
        await interaction.respond(
          getRanks(interaction.guildId ?? ""),
        )
        break
      case "monster":
        await getMHWIMonstersAutocomplete(interaction)
        break
      default:
        await interaction.respond([])
        break
    }
  })
  .build()

const subCommands = new SlashCommandBuilder()
  .setName("mhwi-progress")
  .setNameLocalizations({
    fr: "mhwi-progres"
  })
  .setDescription("Everything about your Monster Hunter World : Iceborne progression is here")
  .setDescriptionLocalizations({
    fr: "Tout ce qui concerne votre progression dans Monster Hunter World : Iceborne est ici"
  })
  .addSubcommand(
    subcommand => subcommand
      .setName("rank")
      .setNameLocalizations({
        fr: "rang"
      })
      .setDescription("View your current rank progress")
      .setDescriptionLocalizations({
        fr: "Affichez le progrès de votre rang"
      })
      .addStringOption(option =>
        option
          .setName("rank")
          .setNameLocalizations({
            fr: "rang"
          })
          .setDescription("The rank from which you desire to know the progress")
          .setDescriptionLocalizations({
            fr: "Le rang pour lequel on désire connaître la progression"
          })
          .setRequired(true)
          .setAutocomplete(true)
      )
      .addStringOption(option =>
        option
          .setName("category")
          .setNameLocalizations({
            fr: "objectif"
          })
          .setDescription("The ranking category applied to your rank")
          .setDescriptionLocalizations({
            fr: "La catégorie du rang appliquée à votre rang"
          })
          .addChoices(
            { name: "Freestyle", name_localizations: { fr: "Libre" }, value: "Freestyle" },
            { name: "Capture", name_localizations: { fr: "Capture" }, value: "Capture" },
            { name: "Gladiator", name_localizations: { fr: "Gladiateur" }, value: "Gladiator" }
          )
      )
  )
  .addSubcommand(
    subcommand => subcommand
      .setName("score-rank")
      .setNameLocalizations({
        fr: "score-rang"
      })
      .setDescription("View your current rank progress")
      .setDescriptionLocalizations({
        fr: "Affichez le progrès de votre rang"
      })
      .addStringOption(option =>
        option
          .setName("rank")
          .setNameLocalizations({
            fr: "rang"
          })
          .setDescription("The rank from which you desire to know the progress")
          .setDescriptionLocalizations({
            fr: "Le rang pour lequel on désire connaître la progression"
          })
          .setRequired(true)
          .setAutocomplete(true)
      )
      .addStringOption(option =>
        option
          .setName("category")
          .setNameLocalizations({
            fr: "categorie"
          })
          .setDescription("The ranking category applied to your rank")
          .setDescriptionLocalizations({
            fr: "La catégorie du rang appliquée à votre rang"
          })
          .addChoices(
            { name: "Freestyle", name_localizations: { fr: "Libre" }, value: "Freestyle" },
            { name: "Capture", name_localizations: { fr: "Capture" }, value: "Capture" },
            { name: "Gladiator", name_localizations: { fr: "Gladiateur" }, value: "Gladiator" }
          )
      )
  )
  .addSubcommand(
    subcommand => subcommand
      .setName("post-solo-hunt")
      .setNameLocalizations({
        fr: "poster-chasse-solo"
      })
      .setDescription("Post a hunt you've done in solo")
      .setDescriptionLocalizations({
        fr: "Postez une chasse que vous avez effectuée en solo"
      })
      .addStringOption(option =>
        option
          .setName("monster")
          .setNameLocalizations({
            fr: "monstre"
          })
          .setDescription("The name of the monster")
          .setDescriptionLocalizations({
            fr: "Le nom du monstre"
          })
          .setRequired(true)
          .setAutocomplete(true)
      )
      .addStringOption(option =>
        option
          .setName("strength")
          .setNameLocalizations({
            fr: "force"
          })
          .setDescription("The strength of the monster")
          .setDescriptionLocalizations({
            fr: "La force du monstre"
          })
          .addChoices(
            ...(Object
            .getOwnPropertyNames(MHWIMonsterStrength)
            .map(strenght => ({
              name: getEnglishMHWIMonsterStrength(strenght as MHWIMonsterStrength),
              name_localizations: { fr: getFrenchMHWIMonsterStrength(strenght as MHWIMonsterStrength) },
              value: strenght
            })))
          )
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName("category")
          .setNameLocalizations({
            fr: "objectif"
          })
          .setDescription("The ranking category applied to your rank")
          .setDescriptionLocalizations({
            fr: "La catégorie du rang appliquée à votre rang"
          })
          .addChoices(
            { name: "Freestyle", name_localizations: { fr: "Libre" }, value: "Freestyle" },
            { name: "Capture", name_localizations: { fr: "Capture" }, value: "Capture" },
            { name: "Gladiator", name_localizations: { fr: "Gladiateur" }, value: "Gladiator" }
          )
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName("time")
          .setNameLocalizations({
            fr: "temps"
          })
          .setDescription("The duration of the hunt")
          .setDescriptionLocalizations({
            fr: "La durée de la chasse"
          })
          .setRequired(true)
      )
  )
  .addSubcommand(
    subcommand => subcommand
      .setName("post-team-hunt")
      .setNameLocalizations({
        fr: "poster-chasse-equipe"
      })
      .setDescription("Post a hunt you've done with a team")
      .setDescriptionLocalizations({
        fr: "Postez une chasse que vous avez effectuée en équipe"
      })
      .addStringOption(option =>
        option
          .setName("monster")
          .setNameLocalizations({
            fr: "monstre"
          })
          .setDescription("The name of the monster")
          .setDescriptionLocalizations({
            fr: "Le nom du monstre"
          })
          .setRequired(true)
          .setAutocomplete(true)
      )
      .addStringOption(option =>
        option
          .setName("strength")
          .setNameLocalizations({
            fr: "force"
          })
          .setDescription("The strength of the monster")
          .setDescriptionLocalizations({
            fr: "La force du monstre"
          })
          .addChoices(
            ...(Object
            .getOwnPropertyNames(MHWIMonsterStrength)
            .map(strenght => ({
              name: getEnglishMHWIMonsterStrength(strenght as MHWIMonsterStrength),
              name_localizations: { fr: getFrenchMHWIMonsterStrength(strenght as MHWIMonsterStrength) },
              value: strenght
            })))
          )
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName("category")
          .setNameLocalizations({
            fr: "categorie"
          })
          .setDescription("The ranking category applied to your rank")
          .setDescriptionLocalizations({
            fr: "La catégorie du rang appliquée à votre rang"
          })
          .addChoices(
            { name: "Freestyle", name_localizations: { fr: "Libre" }, value: "Freestyle" },
            { name: "Capture", name_localizations: { fr: "Capture" }, value: "Capture" },
            { name: "Gladiator", name_localizations: { fr: "Gladiateur" }, value: "Gladiator" }
          )
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName("time")
          .setNameLocalizations({
            fr: "temps"
          })
          .setDescription("The duration of the hunt")
          .setDescriptionLocalizations({
            fr: "La durée de la chasse"
          })
          .setRequired(true)
      )
      .addUserOption(option =>
        option
          .setName("player2")
          .setNameLocalizations({
            fr: "joueur2"
          })
          .setDescription("The second player")
          .setDescriptionLocalizations({
            fr: "Le deuxième joueur"
          })
      )
      .addUserOption(option =>
        option
          .setName("player3")
          .setNameLocalizations({
            fr: "joueur3"
          })
          .setDescription("The third player")
          .setDescriptionLocalizations({
            fr: "Le troisième joueur"
          })
      )
      .addUserOption(option =>
        option
          .setName("player4")
          .setNameLocalizations({
            fr: "joueur4"
          })
          .setDescription("The forth player")
          .setDescriptionLocalizations({
            fr: "Le quatrième joueur"
          })
      )
  )
  .addSubcommand(
    subcommand => subcommand
      .setName("random-monster")
      .setNameLocalizations({
        fr: "monstre-aleatoire"
      })
      .setDescription("Choose randomly a monster")
      .setDescriptionLocalizations({
        fr: "Choisissez un monstre aléatoirement"
      })
      .addBooleanOption(option =>
        option
          .setName("only-missing")
          .setNameLocalizations({
            fr: "seulement-manquant"
          })
          .setDescription("Only choose monsters that are left in your progress list")
          .setDescriptionLocalizations({
            fr: "Ne reprenez que des monstres de votre liste de progrès restant"
          })
      )
      .addStringOption(option =>
        option
          .setName("rank")
          .setNameLocalizations({
            fr: "rang"
          })
          .setDescription("The rank from which you desire to pick monsters")
          .setDescriptionLocalizations({
            fr: "Le rang pour lequel on désire prendre des monstres"
          })
          .setAutocomplete(true)
      )
  )
  .addSubcommand(
    subcommand => subcommand
      .setName("remove-hunt")
      .setNameLocalizations({
        fr: "supprimer-chasse"
      })
      .setDescription("Remove a hunt")
      .setDescriptionLocalizations({
        fr: "Supprimez une chasse"
      })
      .addStringOption(option =>
        option
          .setName("hash")
          .setDescription("The hunt's hash to remove")
          .setDescriptionLocalizations({
            fr: "Le hash de la chasse à supprimer"
          })
          .setRequired(true)
      )
      .addBooleanOption(option =>
        option
          .setName("in-team")
          .setNameLocalizations({
            fr: "en-equipe"
          })
          .setDescription("The hash should correspond to a team hash")
          .setDescriptionLocalizations({
            fr: "Le hash est le hash d'une chasse en équipe"
          })
          .setRequired(true)
      )
  )
  .addSubcommand(
    subCommand => subCommand
      .setName("my-rank")
      .setNameLocalizations({
        fr: "mon-rang"
      })
      .setDescription("Show your hunter rank")
      .setDescriptionLocalizations({
        fr: "Affichez votre rang de chasseur"
      })
      .addStringOption(option =>
        option
          .setName("category")
          .setNameLocalizations({
            fr: "categorie"
          })
          .setDescription("The ranking category applied to your rank")
          .setDescriptionLocalizations({
            fr: "La catégorie du rang appliquée à votre rang"
          })
          .addChoices(
            { name: "Freestyle", name_localizations: { fr: "Libre" }, value: "Freestyle" },
            { name: "Capture", name_localizations: { fr: "Capture" }, value: "Capture" },
            { name: "Gladiator", name_localizations: { fr: "Gladiateur" }, value: "Gladiator" }
          )
      )
  )
  .toJSON()


export const MHWIProgress = {
  ...subCommands,
  autocomplete: baseCommand.autocomplete,
  cooldown: baseCommand.cooldown,
  run: baseCommand.run,
}
