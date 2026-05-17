import { Metadata } from "next"
import ColorConverterTool from "@/components/color-converter/color-converter-tool"

export const metadata: Metadata = {
  title: "Color Converter | Nilanjan Deb Tools",
  description: "Convert between HEX, RGB, and HSL color formats with live preview.",
}

export default function ColorConverterPage() {
  return (
    <main className="container px-4 md:px-6 mx-auto py-10">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Color Converter</h1>
      <p className="text-muted-foreground mb-6">
        Convert between HEX, RGB, and HSL color formats. Live preview with contrast info.
      </p>
      <ColorConverterTool />
    </main>
  )
}
