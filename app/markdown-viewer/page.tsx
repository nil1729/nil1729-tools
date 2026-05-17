import type { Metadata } from "next"
import MarkdownViewerTool from "@/components/markdown-viewer/markdown-viewer-tool"

export const metadata: Metadata = {
  title: "Markdown Viewer",
  description:
    "Paste Markdown and see it rendered instantly. Supports GFM tables, code blocks, and more.",
  alternates: { canonical: "https://tools.nilanjandeb.com/markdown-viewer" },
  openGraph: {
    title: "Markdown Viewer | Nilanjan Deb Tools",
    description: "Paste Markdown and see it rendered instantly in your browser.",
    url: "https://tools.nilanjandeb.com/markdown-viewer",
  },
}

export default function MarkdownViewerPage() {
  return (
    <div className="container px-4 md:px-6 mx-auto py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Markdown Viewer</h1>
        <p className="text-muted-foreground">
          Paste Markdown on the left, see it rendered on the right in real-time.
        </p>
      </div>
      <MarkdownViewerTool />
    </div>
  )
}
