"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import CodeMirror from "@uiw/react-codemirror"
import { json } from "@codemirror/lang-json"
import { githubLight } from "@uiw/codemirror-theme-github"
import { dracula } from "@uiw/codemirror-theme-dracula"
import { EditorView } from "@codemirror/view"

interface OutputPanelProps {
  output: string
  fontSize: number
}

export default function OutputPanel({ output, fontSize }: OutputPanelProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!output) {
    return (
      <div className="h-full overflow-auto p-4 font-mono text-muted-foreground flex items-start" style={{ fontSize: `${fontSize}px` }}>
        <span>Formatted output will appear here.</span>
      </div>
    )
  }

  if (!mounted) {
    return (
      <div className="h-full overflow-auto">
        <pre className="p-4 font-mono whitespace-pre-wrap break-all leading-relaxed" style={{ fontSize: `${fontSize}px` }}>
          {output}
        </pre>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto">
      <CodeMirror
        value={output}
        readOnly
        editable={false}
        extensions={[json(), EditorView.lineWrapping]}
        theme={resolvedTheme === "dark" ? dracula : githubLight}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: false,
          foldGutter: true,
          autocompletion: false,
          closeBrackets: false,
        }}
        style={{ height: "100%", fontSize: `${fontSize}px` }}
        className="h-full font-mono"
      />
    </div>
  )
}
