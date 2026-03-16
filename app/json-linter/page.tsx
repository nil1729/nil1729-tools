import type { Metadata } from "next"
import LinterTool from "@/components/json-linter/linter-tool"

export const metadata: Metadata = {
  title: "JSON Linter & Formatter",
  description:
    "Validate and format JSON instantly in your browser. No ads, no tracking. Paste JSON and get clean, readable output.",
  alternates: { canonical: "https://tools.nilanjandeb.com/json-linter" },
  openGraph: {
    title: "JSON Linter & Formatter | Nilanjan Deb Tools",
    description:
      "Validate and format JSON instantly in your browser. No ads, no tracking.",
    url: "https://tools.nilanjandeb.com/json-linter",
  },
}

export default function JsonLinterPage() {
  return (
    <div className="container px-4 md:px-6 mx-auto py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">JSON Linter & Formatter</h1>
        <p className="text-muted-foreground">
          Paste JSON on the left, click Format or Validate, see clean output on the right.
        </p>
      </div>
      <LinterTool />
    </div>
  )
}
