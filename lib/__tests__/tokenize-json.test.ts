import { describe, it, expect } from 'vitest'
import { tokenizeJson } from '../tokenize-json'
import type { Token } from '../tokenize-json'

const byType = (tokens: Token[], type: string) =>
  tokens.filter(t => t.type === type).map(t => t.value)

describe('tokenizeJson', () => {
  it('tokenizes a simple object', () => {
    const tokens = tokenizeJson('{"name":"Alice"}')
    expect(byType(tokens, 'key')).toEqual(['"name"'])
    expect(byType(tokens, 'string')).toEqual(['"Alice"'])
    expect(byType(tokens, 'punctuation')).toEqual(['{', ':', '}'])
  })

  it('distinguishes object keys from string values', () => {
    const tokens = tokenizeJson('{"key":"value"}')
    const keys = tokens.filter(t => t.type === 'key')
    const strings = tokens.filter(t => t.type === 'string')
    expect(keys).toHaveLength(1)
    expect(strings).toHaveLength(1)
    expect(keys[0].value).toBe('"key"')
    expect(strings[0].value).toBe('"value"')
  })

  it('tokenizes number, boolean, null values', () => {
    const tokens = tokenizeJson('{"a":42,"b":true,"c":false,"d":null}')
    expect(byType(tokens, 'number')).toEqual(['42'])
    expect(byType(tokens, 'boolean')).toEqual(['true', 'false'])
    expect(byType(tokens, 'null')).toEqual(['null'])
  })

  it('tokenizes nested objects', () => {
    const json = JSON.stringify({ outer: { inner: 1 } }, null, 2)
    const tokens = tokenizeJson(json)
    expect(byType(tokens, 'key')).toEqual(['"outer"', '"inner"'])
    expect(byType(tokens, 'number')).toEqual(['1'])
  })

  it('tokenizes arrays', () => {
    const tokens = tokenizeJson('[1,2,3]')
    expect(byType(tokens, 'number')).toEqual(['1', '2', '3'])
    expect(byType(tokens, 'punctuation')).toContain('[')
    expect(byType(tokens, 'punctuation')).toContain(']')
    expect(byType(tokens, 'key')).toEqual([])
  })

  it('preserves whitespace tokens', () => {
    const tokens = tokenizeJson('{\n  "a": 1\n}')
    const wsTokens = tokens.filter(t => t.type === 'whitespace')
    expect(wsTokens.length).toBeGreaterThan(0)
    const allWs = wsTokens.map(t => t.value).join('')
    expect(allWs).toContain('\n')
  })

  it('handles strings with escape sequences', () => {
    const tokens = tokenizeJson('{"msg":"hello \\"world\\""}')
    expect(byType(tokens, 'string')).toEqual(['"hello \\"world\\""'])
  })

  it('handles negative numbers', () => {
    const tokens = tokenizeJson('{"x":-3.14}')
    expect(byType(tokens, 'number')).toEqual(['-3.14'])
  })

  it('handles a JSON array of strings (no keys)', () => {
    const tokens = tokenizeJson('["foo","bar"]')
    expect(byType(tokens, 'key')).toEqual([])
    expect(byType(tokens, 'string')).toEqual(['"foo"', '"bar"'])
  })

  it('round-trips: joining all token values reconstructs the original JSON', () => {
    const original = JSON.stringify({ a: 1, b: [true, null, "x"], c: { d: -2.5 } }, null, 2)
    const tokens = tokenizeJson(original)
    const reconstructed = tokens.map(t => t.value).join('')
    expect(reconstructed).toBe(original)
  })
})
