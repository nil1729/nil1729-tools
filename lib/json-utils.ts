export type ParseError =
  | { line: number; col: number; message: string }
  | { message: string }

export type FormatResult =
  | { ok: true; output: string }
  | { ok: false; error: ParseError }

export type ValidateResult =
  | { ok: true }
  | { ok: false; error: ParseError }

export function parseErrorLocation(
  syntaxMessage: string,
  rawInput: string
): ParseError {
  // Firefox: "line X column Y"
  const ffMatch = syntaxMessage.match(/line (\d+) column (\d+)/i)
  if (ffMatch) {
    return {
      line: parseInt(ffMatch[1], 10),
      col: parseInt(ffMatch[2], 10),
      message: syntaxMessage,
    }
  }

  // V8: "at position N" (N is a character offset from start of string)
  const v8Match = syntaxMessage.match(/at position (\d+)/i)
  if (v8Match) {
    const pos = parseInt(v8Match[1], 10)
    const lines = rawInput.split('\n')
    let remaining = pos
    for (let i = 0; i < lines.length; i++) {
      if (remaining <= lines[i].length) {
        // NOTE: <= not < — position equal to line.length means the trailing newline
        return { line: i + 1, col: remaining + 1, message: syntaxMessage }
      }
      remaining -= lines[i].length + 1 // +1 for the newline character
    }
  }

  return { message: syntaxMessage }
}

export function validateJson(input: string): ValidateResult {
  try {
    JSON.parse(input)
    return { ok: true }
  } catch (e) {
    const err = e as SyntaxError
    return { ok: false, error: parseErrorLocation(err.message, input) }
  }
}

export function formatJson(input: string, indent: 2 | 4 | '\t'): FormatResult {
  try {
    const parsed: unknown = JSON.parse(input)
    const output = JSON.stringify(parsed, null, indent)
    return { ok: true, output }
  } catch (e) {
    const err = e as SyntaxError
    return { ok: false, error: parseErrorLocation(err.message, input) }
  }
}
