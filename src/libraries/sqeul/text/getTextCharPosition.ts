export type TextPosition = {
  line: number,
  char: number,
  lineChar: number
}

/**
 * Gives the character's line, position in a line and position in the string. `line`, `char` and `lineChar` start at index 0.
 * @param content The string content where we want the character position.
 * @param specifiedIndex The index at which we want the position in the text.
 */
export function getTextCharPosition(content: string, specifiedIndex?: number): TextPosition {
  const result = {
    line: 0,
    char: 0,
    lineChar: 0
  }
  const lastIndex = specifiedIndex ?? content.length - 1
  for(let i = 0; i <= lastIndex; i++) {
    result.lineChar++
    result.char++
    if(content[i] === '\n') {
      result.line++
      result.lineChar = 0
    }
  }
  return result;
}
