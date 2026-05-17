import type { Metadata } from "next"
import JwtDecoderTool from "@/components/jwt-decoder/jwt-decoder-tool"

export const metadata: Metadata = {
  title: "JWT Decoder",
  description:
    "Decode JSON Web Tokens instantly. View header, payload, and expiration — all client-side.",
  alternates: { canonical: "https://tools.nilanjandeb.com/jwt-decoder" },
  openGraph: {
    title: "JWT Decoder | Nilanjan Deb Tools",
    description: "Decode JSON Web Tokens instantly. View header, payload, and expiration.",
    url: "https://tools.nilanjandeb.com/jwt-decoder",
  },
}

export default function JwtDecoderPage() {
  return (
    <div className="container px-4 md:px-6 mx-auto py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">JWT Decoder</h1>
        <p className="text-muted-foreground">
          Paste a JWT token to decode its header, payload, and check expiration.
        </p>
      </div>
      <JwtDecoderTool />
    </div>
  )
}
