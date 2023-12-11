import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js"


export type PaginationButton = {
  label: string,
  style?: ButtonStyle,
  disabled?: boolean
}

export const createPaginationButtons = (ctx: {
  id: string,
  previousButton: PaginationButton,
  nextButton: PaginationButton,
  offset: number,
  limit: number,
  count: number,
}) => {

  const { id, offset, limit, count, previousButton, nextButton } = ctx

  const previousId = `previous-${id}`
  const nextId = `next-${id}`

  const previous = new ButtonBuilder()
    .setCustomId(previousId)
    .setLabel(previousButton.label)
    .setStyle(previousButton.style ?? ButtonStyle.Primary)
    .setDisabled(previousButton.disabled !== undefined ? previousButton.disabled : false)

  const next = new ButtonBuilder()
    .setCustomId(nextId)
    .setLabel(nextButton.label)
    .setStyle(nextButton.style ?? ButtonStyle.Primary)
    .setDisabled(nextButton.disabled !== undefined ? nextButton.disabled : false)

  let hasComponents = false
  const row = new ActionRowBuilder<ButtonBuilder>()
  if(offset !== 0) {
    row.addComponents(previous)
    hasComponents = true
  }
  const isEnd = (offset * limit + limit) >= count
  if(!isEnd) {
    row.addComponents(next)
    hasComponents = true
  }

  return {
    previousId,
    nextId,
    components: hasComponents ? [ row ] : []
  }
}