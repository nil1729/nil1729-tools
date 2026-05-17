import { Metadata } from "next"
import TimestampTool from "@/components/timestamp/timestamp-tool"

export const metadata: Metadata = {
  title: "Unix Timestamp Converter | Nilanjan Deb Tools",
  description: "Convert between Unix timestamps and human-readable dates. Supports seconds and milliseconds.",
}

export default function TimestampPage() {
  return (
    <main className="container px-4 md:px-6 mx-auto py-10">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Unix Timestamp Converter</h1>
      <p className="text-muted-foreground mb-6">
        Convert between Unix timestamps and human-readable dates. Live clock included.
      </p>
      <TimestampTool />
    </main>
  )
}
