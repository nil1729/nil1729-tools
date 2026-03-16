import type { ParseError } from "@/lib/json-utils"

type Status = "idle" | "valid" | "error"

interface StatusBarProps {
  status: Status
  error: ParseError | null
}

function formatError(error: ParseError): string {
  if ('line' in error && 'col' in error) {
    return `Error at line ${error.line}, col ${error.col}: ${error.message}`
  }
  return `Error: ${error.message}`
}

export default function StatusBar({ status, error }: StatusBarProps) {
  if (status === "idle") return null

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm font-mono border-t">
      {status === "valid" && (
        <>
          <span className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
          <span className="text-green-600 dark:text-green-400">Valid JSON</span>
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
