"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { GitCompare, Trash2, Columns2, Rows3 } from "lucide-react"
import { computeDiff, getDiffStats } from "@/lib/diff-utils"
import type { DiffLine } from "@/lib/diff-utils"

type ViewMode = "unified" | "split"

function UnifiedDiffView({ diffLines }: { diffLines: DiffLine[] }) {
  if (diffLines.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Both inputs are empty.
      </div>
    )
  }

  return (
    <table className="w-full text-sm font-mono">
      <tbody>
        {diffLines.map((line, idx) => (
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
        ))}
      </tbody>
    </table>
  )
}

function SplitDiffView({ diffLines }: { diffLines: DiffLine[] }) {
  if (diffLines.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Both inputs are empty.
      </div>
    )
  }

  // Build left/right aligned rows for side-by-side
  const rows: Array<{
    left: { lineNo?: number; content: string; type: "equal" | "removed" | "empty" }
    right: { lineNo?: number; content: string; type: "equal" | "added" | "empty" }
  }> = []

  let i = 0
  while (i < diffLines.length) {
    const line = diffLines[i]

    if (line.type === "equal") {
      rows.push({
        left: { lineNo: line.leftLineNo, content: line.content, type: "equal" },
        right: { lineNo: line.rightLineNo, content: line.content, type: "equal" },
      })
      i++
    } else if (line.type === "removed") {
      // Collect consecutive removes
      const removes: DiffLine[] = []
      while (i < diffLines.length && diffLines[i].type === "removed") {
        removes.push(diffLines[i])
        i++
      }
      // Collect consecutive adds that follow
      const adds: DiffLine[] = []
      while (i < diffLines.length && diffLines[i].type === "added") {
        adds.push(diffLines[i])
        i++
      }
      // Pair them up
      const maxLen = Math.max(removes.length, adds.length)
      for (let j = 0; j < maxLen; j++) {
        rows.push({
          left: j < removes.length
            ? { lineNo: removes[j].leftLineNo, content: removes[j].content, type: "removed" }
            : { content: "", type: "empty" },
          right: j < adds.length
            ? { lineNo: adds[j].rightLineNo, content: adds[j].content, type: "added" }
            : { content: "", type: "empty" },
        })
      }
    } else if (line.type === "added") {
      rows.push({
        left: { content: "", type: "empty" },
        right: { lineNo: line.rightLineNo, content: line.content, type: "added" },
      })
      i++
    } else {
      i++
    }
  }

  return (
    <div className="grid grid-cols-2 divide-x">
      {/* Left side */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-mono">
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={idx}
                className={
                  row.left.type === "removed"
                    ? "bg-red-500/10"
                    : row.left.type === "empty"
                    ? "bg-muted/20"
                    : ""
                }
              >
                <td className="w-10 px-2 py-0.5 text-right text-xs text-muted-foreground select-none border-r">
                  {row.left.lineNo ?? ""}
                </td>
                <td className="w-5 px-1 py-0.5 text-center select-none">
                  {row.left.type === "removed" && <span className="text-red-600 dark:text-red-400">−</span>}
                </td>
                <td className="px-2 py-0.5 whitespace-pre-wrap break-all">
                  {row.left.content || " "}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Right side */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-mono">
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={idx}
                className={
                  row.right.type === "added"
                    ? "bg-green-500/10"
                    : row.right.type === "empty"
                    ? "bg-muted/20"
                    : ""
                }
              >
                <td className="w-10 px-2 py-0.5 text-right text-xs text-muted-foreground select-none border-r">
                  {row.right.lineNo ?? ""}
                </td>
                <td className="w-5 px-1 py-0.5 text-center select-none">
                  {row.right.type === "added" && <span className="text-green-600 dark:text-green-400">+</span>}
                </td>
                <td className="px-2 py-0.5 whitespace-pre-wrap break-all">
                  {row.right.content || " "}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function DiffCheckerTool() {
  const [original, setOriginal] = useState("")
  const [modified, setModified] = useState("")
  const [diffLines, setDiffLines] = useState<DiffLine[]>([])
  const [hasCompared, setHasCompared] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>("split")

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
      <div className="flex items-center gap-2 flex-wrap">
        <Button onClick={handleCompare} disabled={!original && !modified}>
          <GitCompare className="h-4 w-4 mr-2" />
          Compare
        </Button>
        <Button variant="outline" onClick={handleClear}>
          <Trash2 className="h-4 w-4 mr-2" />
          Clear
        </Button>

        {/* View mode toggle */}
        {hasCompared && (
          <div className="flex items-center border rounded-md overflow-hidden ml-2">
            <button
              className={`flex items-center gap-1 px-3 py-1.5 text-sm transition-colors cursor-pointer ${
                viewMode === "split"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 hover:bg-muted text-muted-foreground"
              }`}
              onClick={() => setViewMode("split")}
            >
              <Columns2 className="h-3.5 w-3.5" />
              Side by Side
            </button>
            <button
              className={`flex items-center gap-1 px-3 py-1.5 text-sm transition-colors cursor-pointer ${
                viewMode === "unified"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 hover:bg-muted text-muted-foreground"
              }`}
              onClick={() => setViewMode("unified")}
            >
              <Rows3 className="h-3.5 w-3.5" />
              Unified
            </button>
          </div>
        )}

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
            {viewMode === "unified" ? (
              <UnifiedDiffView diffLines={diffLines} />
            ) : (
              <SplitDiffView diffLines={diffLines} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
