import type { ParseError } from "@/lib/json-utils"
import { computeJsonStats, formatBytes } from "@/lib/json-stats"

type Status = "idle" | "valid" | "error"

interface StatusBarProps {
  status: Status
  error: ParseError | null
  input: string
}

function formatError(error: ParseError): string {
  if ('line' in error && 'col' in error) {
    return `Error at line ${error.line}, col ${error.col}: ${error.message}`
  }
  return `Error: ${error.message}`
}

export default function StatusBar({ status, error, input }: StatusBarProps) {
  if (status === "idle") return null

  const stats = status === "valid" ? computeJsonStats(input) : null

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm font-mono border-t">
      {status === "valid" && (
        <>
          <span className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
          <span className="text-green-600 dark:text-green-400">Valid JSON</span>
          {stats && (
            <span className="text-muted-foreground ml-2">
              {formatBytes(stats.bytes)} • {stats.keys} keys • depth {stats.depth} • {stats.objects} {stats.objects === 1 ? "object" : "objects"} • {stats.arrays} {stats.arrays === 1 ? "array" : "arrays"}
            </span>
          )}
        </>
      )}
      {status === "error" && error && (
        <>
          <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
          <span className="text-red-600 dark:text-red-400">{formatError(error)}</span>
        </>
      )}
    </div>
  )
}
