/**
 * Display the string as an escaped unicode text content, helping out to checkout for new lines or other weird characters that can't be visible on the console easily.
 * @param text The string to escape with unicode.
 */
export function escapeUnicode(text: string) {
  return text.normalize("NFC")
}
/**
 * Display the string as an encoded unicode text content.
 * @param text The string to encode in unicode.
 */
export function encodeUnicode(text: string) {
  return text.normalize("NFD")
}
