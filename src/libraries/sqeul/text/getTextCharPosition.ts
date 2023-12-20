export type TextPosition = {
  line: number,
  lineChar: number
}

/**
 * Gives the character's line and position in a line. `line` and `lineChar` start at index 0.
 * @param content The string content where we want the character position.
 * @param specifiedIndex The index at which we want the position in the text.
 * @returns The character position and the line of the specified Index.
 */
export function getTextCharPosition(content: string, specifiedIndex?: number): TextPosition {
  const result = {
    line: 0,
    lineChar: 0
  }
  const lastIndex = specifiedIndex ?? content.length - 1
  for(let i = 0; i <= lastIndex; i++) {
    result.lineChar++
    if(content[i] === '\n') {
      result.line++
      result.lineChar = 0
    }
  }
  return result;
}
