import { Metadata } from "next"
import YamlJsonTool from "@/components/yaml-json/yaml-json-tool"

export const metadata: Metadata = {
  title: "YAML ↔ JSON Converter | Nilanjan Deb Tools",
  description: "Convert between YAML and JSON formats instantly. 100% client-side.",
}

export default function YamlJsonPage() {
  return (
    <main className="container px-4 md:px-6 mx-auto py-10">
      <h1 className="text-3xl font-bold tracking-tight mb-2">YAML ↔ JSON Converter</h1>
      <p className="text-muted-foreground mb-6">
        Convert between YAML and JSON formats. Paste either format and convert instantly.
      </p>
      <YamlJsonTool />
    </main>
  )
}
