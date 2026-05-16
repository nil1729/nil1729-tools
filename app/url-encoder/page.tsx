import type { Metadata } from "next"
import UrlEncoderTool from "@/components/url-encoder/url-encoder-tool"

export const metadata: Metadata = {
  title: "URL Encoder & Decoder",
  description:
    "Encode and decode URL components instantly. Handles special characters, query strings, and full URLs.",
  alternates: { canonical: "https://tools.nilanjandeb.com/url-encoder" },
  openGraph: {
    title: "URL Encoder & Decoder | Nilanjan Deb Tools",
    description: "Encode and decode URL components instantly in your browser.",
    url: "https://tools.nilanjandeb.com/url-encoder",
  },
}

export default function UrlEncoderPage() {
  return (
    <div className="container px-4 md:px-6 mx-auto py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">URL Encoder & Decoder</h1>
        <p className="text-muted-foreground">
          Encode special characters for URLs or decode percent-encoded strings.
        </p>
      </div>
      <UrlEncoderTool />
    </div>
  )
}
