import { tokenizeJson } from "@/lib/tokenize-json"
import type { Token } from "@/lib/tokenize-json"

const TOKEN_CLASS: Partial<Record<Token["type"], string>> = {
  key:         "json-key",
  string:      "json-string",
  number:      "json-number",
  boolean:     "json-boolean",
  null:        "json-null",
  punctuation: "json-punctuation",
}

interface OutputPanelProps {
  output: string
  fontSize: number
}

export default function OutputPanel({ output, fontSize }: OutputPanelProps) {
  if (!output) {
    return (
      <div className="h-full overflow-auto p-4 font-mono text-muted-foreground flex items-start" style={{ fontSize: `${fontSize}px` }}>
        <span>Formatted output will appear here.</span>
      </div>
    )
  }

  const tokens = tokenizeJson(output)

  return (
    <div className="h-full overflow-auto">
      <pre className="p-4 font-mono whitespace-pre leading-relaxed" style={{ fontSize: `${fontSize}px` }}>
        {tokens.map((token, index) => {
          const cls = TOKEN_CLASS[token.type]
          return cls
            ? <span key={index} className={cls}>{token.value}</span>
            : <span key={index}>{token.value}</span>
        })}
      </pre>
    </div>
  )
}
