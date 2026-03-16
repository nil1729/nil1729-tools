import { describe, it, expect } from 'vitest'
import { formatJson, validateJson, parseErrorLocation } from '../json-utils'

describe('parseErrorLocation', () => {
  it('extracts position from V8 error messages', () => {
    const input = '{"a": bad}'
    const result = parseErrorLocation("Unexpected token 'b', \"{'a': bad}\" is not valid JSON at position 6", input)
    expect(result).toMatchObject({ line: 1, col: 7, message: expect.any(String) })
  })

  it('handles V8 position on second line', () => {
    const input = '{\n  "a": bad\n}'
    const result = parseErrorLocation('Unexpected token at position 9', input)
    expect(result).toMatchObject({ line: 2, col: 8 })
  })

  it('handles V8 position at end of line (on the newline itself)', () => {
    const input = 'ab\ncd'
    const result = parseErrorLocation('error at position 2', input)
    expect(result).toMatchObject({ line: 1, col: 3 })
  })

  it('extracts line/col from Firefox error messages', () => {
    const result = parseErrorLocation('JSON.parse: expected property name or \'}\' at line 2 column 3 of the JSON data', '{}')
    expect(result).toMatchObject({ line: 2, col: 3 })
  })

  it('falls back to raw message when format is unknown', () => {
    const result = parseErrorLocation('Unexpected end of JSON input', '{}')
    expect(result).toEqual({ message: 'Unexpected end of JSON input' })
    expect(result).not.toHaveProperty('line')
  })

  it('handles a real SyntaxError from JSON.parse (integration)', () => {
    const input = '{"a": bad}'
    let thrownMessage = ''
    try {
      JSON.parse(input)
    } catch (e) {
      thrownMessage = (e as SyntaxError).message
    }
    const result = parseErrorLocation(thrownMessage, input)
    expect(result).toHaveProperty('message')
    if ('line' in result) {
      expect(result.line).toBeGreaterThanOrEqual(1)
      expect(result.col).toBeGreaterThanOrEqual(1)
    }
  })
})

describe('validateJson', () => {
  it('returns ok:true for valid JSON', () => {
    expect(validateJson('{"a": 1}')).toEqual({ ok: true })
  })

  it('returns ok:true for valid JSON array', () => {
    expect(validateJson('[1, 2, 3]')).toEqual({ ok: true })
  })

  it('returns ok:true for valid JSON primitives', () => {
    expect(validateJson('"hello"')).toEqual({ ok: true })
    expect(validateJson('42')).toEqual({ ok: true })
    expect(validateJson('true')).toEqual({ ok: true })
    expect(validateJson('null')).toEqual({ ok: true })
  })

  it('returns ok:false with error for invalid JSON', () => {
    const result = validateJson('{bad}')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toHaveProperty('message')
    }
  })

  it('returns ok:false for empty string', () => {
    expect(validateJson('')).toMatchObject({ ok: false })
  })
})

describe('formatJson', () => {
  it('formats valid JSON with 2-space indent', () => {
    const result = formatJson('{"a":1,"b":2}', 2)
    expect(result).toEqual({
      ok: true,
      output: '{\n  "a": 1,\n  "b": 2\n}',
    })
  })

  it('formats valid JSON with 4-space indent', () => {
    const result = formatJson('{"a":1}', 4)
    expect(result).toEqual({ ok: true, output: '{\n    "a": 1\n}' })
  })

  it('formats valid JSON with tab indent', () => {
    const result = formatJson('{"a":1}', '\t')
    expect(result).toEqual({ ok: true, output: '{\n\t"a": 1\n}' })
  })

  it('returns ok:false for invalid JSON', () => {
    const result = formatJson('{bad}', 2)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toHaveProperty('message')
    }
  })

  it('does not mutate the input string', () => {
    const input = '{"a":1}'
    formatJson(input, 2)
    expect(input).toBe('{"a":1}')
  })
})
