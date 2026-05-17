import { Metadata } from "next"
import RegexTesterTool from "@/components/regex-tester/regex-tester-tool"

export const metadata: Metadata = {
  title: "Regex Tester | Nilanjan Deb Tools",
  description: "Test regular expressions with live matching, capture groups, and flag toggles. 100% client-side.",
}

export default function RegexTesterPage() {
  return (
    <main className="container px-4 md:px-6 mx-auto py-10">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Regex Tester</h1>
      <p className="text-muted-foreground mb-6">
        Test regular expressions with live matching and capture group extraction.
      </p>
      <RegexTesterTool />
    </main>
  )
}
