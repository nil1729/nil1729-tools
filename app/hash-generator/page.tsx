import { Metadata } from "next"
import HashGeneratorTool from "@/components/hash-generator/hash-generator-tool"

export const metadata: Metadata = {
  title: "Hash Generator | Nilanjan Deb Tools",
  description: "Generate MD5, SHA-1, SHA-256, SHA-512 hashes instantly. 100% client-side using Web Crypto API.",
}

export default function HashGeneratorPage() {
  return (
    <main className="container px-4 md:px-6 mx-auto py-10">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Hash Generator</h1>
      <p className="text-muted-foreground mb-6">
        Generate cryptographic hashes using the Web Crypto API. All computation happens in your browser.
      </p>
      <HashGeneratorTool />
    </main>
  )
}
