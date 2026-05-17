"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, ShieldCheck, ShieldAlert, Clock, KeyRound, Info } from "lucide-react"

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

/**
 * Verify JWT signature using Web Crypto API (HMAC-SHA256/384/512).
 * Returns null if algorithm is unsupported (RSA, etc — need public key).
 */
async function verifyHmacSignature(
  token: string,
  secret: string,
  algorithm: string
): Promise<{ supported: boolean; valid?: boolean }> {
  const algoMap: Record<string, string> = {
    HS256: "SHA-256",
    HS384: "SHA-384",
    HS512: "SHA-512",
  }

  const hashAlgo = algoMap[algorithm]
  if (!hashAlgo) {
    return { supported: false }
  }

  try {
    const parts = token.trim().split(".")
    const signingInput = parts[0] + "." + parts[1]

    const encoder = new TextEncoder()
    const keyData = encoder.encode(secret)
    const data = encoder.encode(signingInput)

    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: hashAlgo },
      false,
      ["sign"]
    )

    const signatureBytes = await crypto.subtle.sign("HMAC", key, data)

    // Convert expected signature from base64url
    const expectedSig = parts[2]
    const base64 = expectedSig.replace(/-/g, "+").replace(/_/g, "/")
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4)
    const expectedBytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0))

    // Compare
    const computedBytes = new Uint8Array(signatureBytes)
    if (computedBytes.length !== expectedBytes.length) {
      return { supported: true, valid: false }
    }
    for (let i = 0; i < computedBytes.length; i++) {
      if (computedBytes[i] !== expectedBytes[i]) {
        return { supported: true, valid: false }
      }
    }
    return { supported: true, valid: true }
  } catch {
    return { supported: true, valid: false }
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
  const [secret, setSecret] = useState("")
  const [verifyResult, setVerifyResult] = useState<{
    status: "idle" | "valid" | "invalid" | "unsupported"
    message: string
  }>({ status: "idle", message: "" })

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
      setVerifyResult({ status: "idle", message: "" })
    } else {
      setDecoded(null)
      setError("Invalid JWT token. Expected format: header.payload.signature")
    }
  }

  const handleVerify = async () => {
    if (!decoded || !secret.trim()) return

    const algorithm = decoded.header.alg as string
    const result = await verifyHmacSignature(input, secret, algorithm)

    if (!result.supported) {
      setVerifyResult({
        status: "unsupported",
        message: `Algorithm "${algorithm}" requires a public key for verification. Only HMAC algorithms (HS256, HS384, HS512) can be verified with a shared secret.`,
      })
    } else if (result.valid) {
      setVerifyResult({ status: "valid", message: "Signature is valid ✓" })
    } else {
      setVerifyResult({ status: "invalid", message: "Signature verification failed — secret does not match." })
    }
  }

  const handleClear = () => {
    setInput("")
    setDecoded(null)
    setError("")
    setSecret("")
    setVerifyResult({ status: "idle", message: "" })
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
            <JsonBlock title="Header (JOSE)" data={decoded.header} />
            <JsonBlock title="Payload (Claims)" data={decoded.payload} />
          </div>

          {/* Signature section with explanation */}
          <div className="border rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-b">
              <KeyRound className="h-4 w-4" />
              <span className="font-semibold text-sm">Signature</span>
            </div>
            <div className="p-4 space-y-3">
              <pre className="text-sm font-mono overflow-x-auto break-all text-muted-foreground">
                {decoded.signature}
              </pre>
              <div className="flex items-start gap-2 p-3 rounded-md bg-blue-500/5 border border-blue-500/20 text-sm">
                <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                <div className="text-muted-foreground">
                  <p>
                    The signature is a <strong>Base64URL-encoded HMAC or RSA hash</strong> that ensures
                    the token hasn&apos;t been tampered with. It&apos;s computed as:
                  </p>
                  <code className="block mt-2 p-2 rounded bg-muted text-xs font-mono">
                    {decoded.header.alg as string || "ALGORITHM"}(base64UrlEncode(header) + &quot;.&quot; + base64UrlEncode(payload), secret)
                  </code>
                  <p className="mt-2">
                    Without the secret/private key, you can decode the token but cannot verify it was issued
                    by a trusted source.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Signature verification */}
          <div className="border rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-b">
              <ShieldCheck className="h-4 w-4" />
              <span className="font-semibold text-sm">Signature Verification</span>
              <span className="text-xs text-muted-foreground">(Optional)</span>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                Enter the secret used to sign the JWT to verify its authenticity:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border rounded-md font-mono text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-ring"
                  value={secret}
                  onChange={(e) => { setSecret(e.target.value); setVerifyResult({ status: "idle", message: "" }) }}
                  placeholder="your-256-bit-secret"
                  spellCheck={false}
                />
                <Button size="sm" onClick={handleVerify} disabled={!secret.trim()}>
                  <KeyRound className="h-4 w-4 mr-1" /> Verify
                </Button>
              </div>

              {verifyResult.status !== "idle" && (
                <div className={`flex items-center gap-2 px-4 py-3 rounded-md text-sm ${
                  verifyResult.status === "valid"
                    ? "bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/30"
                    : verifyResult.status === "invalid"
                    ? "bg-destructive/10 text-destructive border border-destructive/30"
                    : "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-500/30"
                }`}>
                  {verifyResult.status === "valid" && <ShieldCheck className="h-4 w-4" />}
                  {verifyResult.status === "invalid" && <ShieldAlert className="h-4 w-4" />}
                  {verifyResult.status === "unsupported" && <Info className="h-4 w-4" />}
                  {verifyResult.message}
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                ⚠️ All verification happens client-side. Your secret never leaves the browser.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
