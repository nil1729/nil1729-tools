import type { Metadata } from "next"
import DiffCheckerTool from "@/components/diff-checker/diff-checker-tool"

export const metadata: Metadata = {
  title: "Diff Checker",
  description:
    "Compare two texts side-by-side and see differences highlighted. Supports line-by-line and word-level diffs.",
  alternates: { canonical: "https://tools.nilanjandeb.com/diff-checker" },
  openGraph: {
    title: "Diff Checker | Nilanjan Deb Tools",
    description: "Compare two texts side-by-side and see differences highlighted.",
    url: "https://tools.nilanjandeb.com/diff-checker",
  },
}

export default function DiffCheckerPage() {
  return (
    <div className="container px-4 md:px-6 mx-auto py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Diff Checker</h1>
        <p className="text-muted-foreground">
          Paste original and modified text to see differences highlighted.
        </p>
      </div>
      <DiffCheckerTool />
    </div>
  )
}
