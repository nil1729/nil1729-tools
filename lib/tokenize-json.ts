export type TokenType =
  | 'key'
  | 'string'
  | 'number'
  | 'boolean'
  | 'null'
  | 'punctuation'
  | 'whitespace'

export type Token = { type: TokenType; value: string }

/**
 * Tokenizes a well-formed JSON string (e.g. output of JSON.stringify) into
 * typed tokens for syntax-colored rendering as React <span> elements.
 *
 * A string is identified as a key when the next non-whitespace character
 * after the closing quote is a colon ":". This is safe because JSON.stringify
 * output is always valid and keys are always followed by ":".
 */
export function tokenizeJson(json: string): Token[] {
  const tokens: Token[] = []
  let i = 0

  while (i < json.length) {
    const ch = json[i]

    // Whitespace
    if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
      let ws = ''
      while (i < json.length) {
        const c = json[i]
        if (c === ' ' || c === '\t' || c === '\n' || c === '\r') {
          ws += c
          i++
        } else {
          break
        }
      }
      tokens.push({ type: 'whitespace', value: ws })
      continue
    }

    // String (key or value)
    if (ch === '"') {
      let str = '"'
      i++ // skip opening quote
      while (i < json.length) {
        if (json[i] === '\\') {
          // escaped character — consume both the backslash and the next char
          str += json[i] + json[i + 1]
          i += 2
        } else if (json[i] === '"') {
          str += '"'
          i++
          break
        } else {
          str += json[i++]
        }
      }

      // Look ahead past whitespace for ":" to determine if this is a key
      let j = i
      while (j < json.length) {
        const c = json[j]
        if (c === ' ' || c === '\t' || c === '\n' || c === '\r') {
          j++
        } else {
          break
        }
      }
      const isKey = json[j] === ':'
      tokens.push({ type: isKey ? 'key' : 'string', value: str })
      continue
    }

    // Number (including negative)
    if (ch === '-' || (ch >= '0' && ch <= '9')) {
      let num = ''
      while (i < json.length) {
        const c = json[i]
        if (c === '-' || c === '+' || c === '.' || c === 'e' || c === 'E' ||
            (c >= '0' && c <= '9')) {
          num += c
          i++
        } else {
          break
        }
      }
      tokens.push({ type: 'number', value: num })
      continue
    }

    // true
    if (json.startsWith('true', i)) {
      tokens.push({ type: 'boolean', value: 'true' })
      i += 4
      continue
    }

    // false
    if (json.startsWith('false', i)) {
      tokens.push({ type: 'boolean', value: 'false' })
      i += 5
      continue
    }

    // null
    if (json.startsWith('null', i)) {
      tokens.push({ type: 'null', value: 'null' })
      i += 4
      continue
    }

    // Punctuation: { } [ ] : ,
    tokens.push({ type: 'punctuation', value: ch })
    i++
  }

  return tokens
}
