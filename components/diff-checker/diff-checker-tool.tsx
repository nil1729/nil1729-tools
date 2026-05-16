"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { GitCompare, Trash2 } from "lucide-react"
import { computeDiff, getDiffStats } from "@/lib/diff-utils"
import type { DiffLine } from "@/lib/diff-utils"

export default function DiffCheckerTool() {
  const [original, setOriginal] = useState("")
  const [modified, setModified] = useState("")
  const [diffLines, setDiffLines] = useState<DiffLine[]>([])
  const [hasCompared, setHasCompared] = useState(false)

  const handleCompare = () => {
    const result = computeDiff(original, modified)
    setDiffLines(result)
    setHasCompared(true)
  }

  const handleClear = () => {
    setOriginal("")
    setModified("")
    setDiffLines([])
    setHasCompared(false)
  }

  const stats = hasCompared ? getDiffStats(diffLines) : null

  return (
    <div className="flex flex-col gap-4">
      {/* Input panels */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="flex flex-col border rounded-lg overflow-hidden bg-card">
          <div className="px-4 py-2 border-b bg-muted/30">
            <span className="text-sm font-medium text-muted-foreground">Original</span>
          </div>
          <textarea
            className="w-full h-[30vh] p-3 font-mono text-sm bg-transparent resize-none focus:outline-none"
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            placeholder="Paste original text here..."
            spellCheck={false}
          />
        </div>
        <div className="flex flex-col border rounded-lg overflow-hidden bg-card">
          <div className="px-4 py-2 border-b bg-muted/30">
            <span className="text-sm font-medium text-muted-foreground">Modified</span>
          </div>
          <textarea
            className="w-full h-[30vh] p-3 font-mono text-sm bg-transparent resize-none focus:outline-none"
            value={modified}
            onChange={(e) => setModified(e.target.value)}
            placeholder="Paste modified text here..."
            spellCheck={false}
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <Button onClick={handleCompare} disabled={!original && !modified}>
          <GitCompare className="h-4 w-4 mr-2" />
          Compare
        </Button>
        <Button variant="outline" onClick={handleClear}>
          <Trash2 className="h-4 w-4 mr-2" />
          Clear
        </Button>
        {stats && (
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="text-green-600 dark:text-green-400">+{stats.additions}</span>
            <span className="text-red-600 dark:text-red-400">-{stats.deletions}</span>
            <span className="text-muted-foreground">{stats.unchanged} unchanged</span>
          </div>
        )}
      </div>

      {/* Diff output */}
      {hasCompared && (
        <div className="border rounded-lg overflow-hidden bg-card">
          <div className="overflow-x-auto max-h-[50vh] overflow-y-auto">
            <table className="w-full text-sm font-mono">
              <tbody>
                {diffLines.length === 0 ? (
                  <tr>
                    <td className="p-4 text-center text-muted-foreground">
                      Both inputs are empty.
                    </td>
                  </tr>
                ) : (
                  diffLines.map((line, idx) => (
                    <tr
                      key={idx}
                      className={
                        line.type === "added"
                          ? "bg-green-500/10"
                          : line.type === "removed"
                          ? "bg-red-500/10"
                          : ""
                      }
                    >
                      <td className="w-12 px-2 py-0.5 text-right text-xs text-muted-foreground select-none border-r">
                        {line.leftLineNo ?? ""}
                      </td>
                      <td className="w-12 px-2 py-0.5 text-right text-xs text-muted-foreground select-none border-r">
                        {line.rightLineNo ?? ""}
                      </td>
                      <td className="w-6 px-2 py-0.5 text-center select-none">
                        {line.type === "added" && <span className="text-green-600 dark:text-green-400">+</span>}
                        {line.type === "removed" && <span className="text-red-600 dark:text-red-400">−</span>}
                      </td>
                      <td className="px-3 py-0.5 whitespace-pre-wrap break-all">
                        {line.content || " "}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
