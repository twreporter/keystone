export function unicodeInsert(str, index, insertText) {
  const chars = Array.from(str); // code point safe
  chars.splice(index, 0, insertText);
  return chars.join('');
}
