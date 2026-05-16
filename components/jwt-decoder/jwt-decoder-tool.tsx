"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, ShieldCheck, ShieldAlert, Clock } from "lucide-react"

interface DecodedJwt {
  header: Record<string, unknown>
  payload: Record<string, unknown>
  signature: string
  isExpired: boolean | null
  expiresAt: string | null
  issuedAt: string | null
}

function decodeJwt(token: string): DecodedJwt | null {
  try {
    const parts = token.trim().split(".")
    if (parts.length !== 3) return null

    const decodeBase64Url = (str: string) => {
      const base64 = str.replace(/-/g, "+").replace(/_/g, "/")
      const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4)
      return JSON.parse(atob(padded))
    }

    const header = decodeBase64Url(parts[0])
    const payload = decodeBase64Url(parts[1])
    const signature = parts[2]

    let isExpired: boolean | null = null
    let expiresAt: string | null = null
    let issuedAt: string | null = null

    if (payload.exp) {
      const expDate = new Date(payload.exp * 1000)
      isExpired = expDate < new Date()
      expiresAt = expDate.toISOString()
    }
    if (payload.iat) {
      issuedAt = new Date(payload.iat * 1000).toISOString()
    }

    return { header, payload, signature, isExpired, expiresAt, issuedAt }
  } catch {
    return null
  }
}

function JsonBlock({ title, data, icon }: { title: string; data: Record<string, unknown>; icon?: React.ReactNode }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-b">
        {icon}
        <span className="font-semibold text-sm">{title}</span>
      </div>
      <pre className="p-4 text-sm font-mono overflow-x-auto whitespace-pre-wrap break-all">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}

export default function JwtDecoderTool() {
  const [input, setInput] = useState("")
  const [decoded, setDecoded] = useState<DecodedJwt | null>(null)
  const [error, setError] = useState("")

  const handleDecode = () => {
    if (!input.trim()) {
      setDecoded(null)
      setError("")
      return
    }
    const result = decodeJwt(input)
    if (result) {
      setDecoded(result)
      setError("")
    } else {
      setDecoded(null)
      setError("Invalid JWT token. Expected format: header.payload.signature")
    }
  }

  const handleClear = () => {
    setInput("")
    setDecoded(null)
    setError("")
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Input */}
      <div className="flex flex-col border rounded-lg overflow-hidden bg-card">
        <div className="flex items-center gap-2 p-3 border-b bg-muted/30">
          <Button size="sm" onClick={handleDecode}>
            Decode
          </Button>
          <Button size="sm" variant="outline" onClick={handleClear}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <textarea
          className="w-full h-32 p-3 font-mono text-sm bg-transparent resize-none focus:outline-none"
          value={input}
          onChange={(e) => { setInput(e.target.value); setError(""); setDecoded(null) }}
          placeholder="Paste your JWT token here (eyJhbGciOi...)..."
          spellCheck={false}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 border rounded-lg bg-destructive/10 text-destructive text-sm">
          <ShieldAlert className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Decoded output */}
      {decoded && (
        <div className="flex flex-col gap-4">
          {/* Expiration badge */}
          {decoded.isExpired !== null && (
            <div className={`flex items-center gap-2 px-4 py-3 border rounded-lg text-sm ${
              decoded.isExpired
                ? "bg-destructive/10 text-destructive border-destructive/30"
                : "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30"
            }`}>
              {decoded.isExpired ? <ShieldAlert className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
              <span className="font-medium">
                {decoded.isExpired ? "Token is EXPIRED" : "Token is valid (not expired)"}
              </span>
              {decoded.expiresAt && (
                <span className="flex items-center gap-1 ml-auto text-xs opacity-75">
                  <Clock className="h-3 w-3" />
                  {decoded.isExpired ? "Expired" : "Expires"}: {decoded.expiresAt}
                </span>
              )}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <JsonBlock title="Header" data={decoded.header} />
            <JsonBlock title="Payload" data={decoded.payload} />
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-b">
              <span className="font-semibold text-sm">Signature</span>
            </div>
            <pre className="p-4 text-sm font-mono overflow-x-auto break-all text-muted-foreground">
              {decoded.signature}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
