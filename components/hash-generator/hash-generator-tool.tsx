"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface HashResult {
  algorithm: string
  hex: string
  base64: string
}

const ALGORITHMS = [
  { name: "SHA-1", webCrypto: "SHA-1" },
  { name: "SHA-256", webCrypto: "SHA-256" },
  { name: "SHA-384", webCrypto: "SHA-384" },
  { name: "SHA-512", webCrypto: "SHA-512" },
]

async function computeHash(algorithm: string, input: string): Promise<{ hex: string; base64: string }> {
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const hashBuffer = await crypto.subtle.digest(algorithm, data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  const base64 = btoa(String.fromCharCode(...hashArray))
  return { hex, base64 }
}

// Simple MD5 implementation (not in Web Crypto API)
function md5(input: string): string {
  function md5cycle(x: number[], k: number[]) {
    let a = x[0], b = x[1], c = x[2], d = x[3]
    a = ff(a, b, c, d, k[0], 7, -680876936); d = ff(d, a, b, c, k[1], 12, -389564586)
    c = ff(c, d, a, b, k[2], 17, 606105819); b = ff(b, c, d, a, k[3], 22, -1044525330)
    a = ff(a, b, c, d, k[4], 7, -176418897); d = ff(d, a, b, c, k[5], 12, 1200080426)
    c = ff(c, d, a, b, k[6], 17, -1473231341); b = ff(b, c, d, a, k[7], 22, -45705983)
    a = ff(a, b, c, d, k[8], 7, 1770035416); d = ff(d, a, b, c, k[9], 12, -1958414417)
    c = ff(c, d, a, b, k[10], 17, -42063); b = ff(b, c, d, a, k[11], 22, -1990404162)
    a = ff(a, b, c, d, k[12], 7, 1804603682); d = ff(d, a, b, c, k[13], 12, -40341101)
    c = ff(c, d, a, b, k[14], 17, -1502002290); b = ff(b, c, d, a, k[15], 22, 1236535329)
    a = gg(a, b, c, d, k[1], 5, -165796510); d = gg(d, a, b, c, k[6], 9, -1069501632)
    c = gg(c, d, a, b, k[11], 14, 643717713); b = gg(b, c, d, a, k[0], 20, -373897302)
    a = gg(a, b, c, d, k[5], 5, -701558691); d = gg(d, a, b, c, k[10], 9, 38016083)
    c = gg(c, d, a, b, k[15], 14, -660478335); b = gg(b, c, d, a, k[4], 20, -405537848)
    a = gg(a, b, c, d, k[9], 5, 568446438); d = gg(d, a, b, c, k[14], 9, -1019803690)
    c = gg(c, d, a, b, k[3], 14, -187363961); b = gg(b, c, d, a, k[8], 20, 1163531501)
    a = gg(a, b, c, d, k[13], 5, -1444681467); d = gg(d, a, b, c, k[2], 9, -51403784)
    c = gg(c, d, a, b, k[7], 14, 1735328473); b = gg(b, c, d, a, k[12], 20, -1926607734)
    a = hh(a, b, c, d, k[5], 4, -378558); d = hh(d, a, b, c, k[8], 11, -2022574463)
    c = hh(c, d, a, b, k[11], 16, 1839030562); b = hh(b, c, d, a, k[14], 23, -35309556)
    a = hh(a, b, c, d, k[1], 4, -1530992060); d = hh(d, a, b, c, k[4], 11, 1272893353)
    c = hh(c, d, a, b, k[7], 16, -155497632); b = hh(b, c, d, a, k[10], 23, -1094730640)
    a = hh(a, b, c, d, k[13], 4, 681279174); d = hh(d, a, b, c, k[0], 11, -358537222)
    c = hh(c, d, a, b, k[3], 16, -722521979); b = hh(b, c, d, a, k[6], 23, 76029189)
    a = hh(a, b, c, d, k[9], 4, -640364487); d = hh(d, a, b, c, k[12], 11, -421815835)
    c = hh(c, d, a, b, k[15], 16, 530742520); b = hh(b, c, d, a, k[2], 23, -995338651)
    a = ii(a, b, c, d, k[0], 6, -198630844); d = ii(d, a, b, c, k[7], 10, 1126891415)
    c = ii(c, d, a, b, k[14], 15, -1416354905); b = ii(b, c, d, a, k[5], 21, -57434055)
    a = ii(a, b, c, d, k[12], 6, 1700485571); d = ii(d, a, b, c, k[3], 10, -1894986606)
    c = ii(c, d, a, b, k[10], 15, -1051523); b = ii(b, c, d, a, k[1], 21, -2054922799)
    a = ii(a, b, c, d, k[8], 6, 1873313359); d = ii(d, a, b, c, k[15], 10, -30611744)
    c = ii(c, d, a, b, k[6], 15, -1560198380); b = ii(b, c, d, a, k[13], 21, 1309151649)
    a = ii(a, b, c, d, k[4], 6, -145523070); d = ii(d, a, b, c, k[11], 10, -1120210379)
    c = ii(c, d, a, b, k[2], 15, 718787259); b = ii(b, c, d, a, k[9], 21, -343485551)
    x[0] = add32(a, x[0]); x[1] = add32(b, x[1])
    x[2] = add32(c, x[2]); x[3] = add32(d, x[3])
  }
  function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    a = add32(add32(a, q), add32(x, t))
    return add32((a << s) | (a >>> (32 - s)), b)
  }
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & c) | ((~b) & d), a, b, x, s, t)
  }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & d) | (c & (~d)), a, b, x, s, t)
  }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(b ^ c ^ d, a, b, x, s, t)
  }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(c ^ (b | (~d)), a, b, x, s, t)
  }
  function add32(a: number, b: number) {
    return (a + b) & 0xFFFFFFFF
  }

  const n = input.length
  let state = [1732584193, -271733879, -1732584194, 271733878]
  let tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  let i: number, tmp: number

  for (i = 64; i <= n; i += 64) {
    const block = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    for (let j = 0; j < 64; j += 4) {
      block[j >> 2] = input.charCodeAt(i - 64 + j) + (input.charCodeAt(i - 64 + j + 1) << 8) +
        (input.charCodeAt(i - 64 + j + 2) << 16) + (input.charCodeAt(i - 64 + j + 3) << 24)
    }
    md5cycle(state, block)
  }

  for (i = 0; i < 16; i++) tail[i] = 0
  for (i = 0; i < (n % 64); i++) {
    tail[i >> 2] |= input.charCodeAt((n - (n % 64)) + i) << ((i % 4) << 3)
  }
  tail[i >> 2] |= 0x80 << ((i % 4) << 3)
  if (i > 55) {
    md5cycle(state, tail)
    for (i = 0; i < 16; i++) tail[i] = 0
  }
  tmp = n * 8
  tail[14] = tmp & 0xFFFFFFFF
  tail[15] = Math.floor(tmp / 0x100000000)
  md5cycle(state, tail)

  const hex = state.map(s => {
    let h = ""
    for (let j = 0; j < 4; j++) {
      h += ((s >> (j * 8)) & 0xFF).toString(16).padStart(2, "0")
    }
    return h
  }).join("")

  return hex
}

export default function HashGeneratorTool() {
  const [input, setInput] = useState("Hello, World!")
  const [results, setResults] = useState<HashResult[]>([])
  const [uppercase, setUppercase] = useState(false)

  useEffect(() => {
    if (!input) { setResults([]); return }

    const compute = async () => {
      const hashes: HashResult[] = []

      // MD5 (custom implementation)
      const md5Hash = md5(input)
      const md5Bytes = []
      for (let i = 0; i < md5Hash.length; i += 2) {
        md5Bytes.push(parseInt(md5Hash.substring(i, i + 2), 16))
      }
      hashes.push({ algorithm: "MD5", hex: md5Hash, base64: btoa(String.fromCharCode(...md5Bytes)) })

      // Web Crypto hashes
      for (const algo of ALGORITHMS) {
        const { hex, base64 } = await computeHash(algo.webCrypto, input)
        hashes.push({ algorithm: algo.name, hex, base64 })
      }

      setResults(hashes)
    }

    compute()
  }, [input])

  const copyHash = async (value: string) => {
    await navigator.clipboard.writeText(uppercase ? value.toUpperCase() : value)
    toast.success("Hash copied!")
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Input */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Input Text</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full h-32 p-3 font-mono text-sm border rounded-md bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Type or paste text to hash..."
          spellCheck={false}
        />
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{input.length} characters</span>
          <label className="flex items-center gap-1.5 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="rounded"
            />
            Uppercase
          </label>
          <Button size="sm" variant="outline" onClick={() => setInput("")} className="ml-auto">
            <Trash2 className="h-3 w-3 mr-1" /> Clear
          </Button>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-muted/50 px-4 py-2 text-sm font-medium border-b">Hash Values</div>
          <div className="divide-y">
            {results.map(({ algorithm, hex, base64 }) => (
              <div key={algorithm} className="px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{algorithm}</span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => copyHash(hex)} title="Copy hex">
                      <Copy className="h-3 w-3" />
                      <span className="text-xs ml-1">hex</span>
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => copyHash(base64)} title="Copy base64">
                      <Copy className="h-3 w-3" />
                      <span className="text-xs ml-1">b64</span>
                    </Button>
                  </div>
                </div>
                <div className="font-mono text-xs break-all text-muted-foreground">
                  {uppercase ? hex.toUpperCase() : hex}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
