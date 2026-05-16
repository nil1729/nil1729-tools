import type { Metadata } from "next"
import Base64Tool from "@/components/base64/base64-tool"

export const metadata: Metadata = {
  title: "Base64 Encoder & Decoder",
  description:
    "Encode and decode Base64 strings instantly in your browser. No data sent to any server.",
  alternates: { canonical: "https://tools.nilanjandeb.com/base64" },
  openGraph: {
    title: "Base64 Encoder & Decoder | Nilanjan Deb Tools",
    description: "Encode and decode Base64 strings instantly in your browser.",
    url: "https://tools.nilanjandeb.com/base64",
  },
}

export default function Base64Page() {
  return (
    <div className="container px-4 md:px-6 mx-auto py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Base64 Encoder & Decoder</h1>
        <p className="text-muted-foreground">
          Paste text or Base64 on the left, encode or decode instantly.
        </p>
      </div>
      <Base64Tool />
    </div>
  )
}
