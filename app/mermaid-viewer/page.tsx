import type { Metadata } from "next"
import MermaidViewerTool from "@/components/mermaid-viewer/mermaid-viewer-tool"

export const metadata: Metadata = {
  title: "Mermaid Viewer",
  description:
    "Render Mermaid diagrams live in your browser. Flowcharts, sequence diagrams, Gantt charts, and more.",
  alternates: { canonical: "https://tools.nilanjandeb.com/mermaid-viewer" },
  openGraph: {
    title: "Mermaid Viewer | Nilanjan Deb Tools",
    description: "Render Mermaid diagrams live in your browser.",
    url: "https://tools.nilanjandeb.com/mermaid-viewer",
  },
}

export default function MermaidViewerPage() {
  return (
    <div className="container px-4 md:px-6 mx-auto py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Mermaid Viewer</h1>
        <p className="text-muted-foreground">
          Write Mermaid syntax on the left, see the diagram rendered on the right.
        </p>
      </div>
      <MermaidViewerTool />
    </div>
  )
}
