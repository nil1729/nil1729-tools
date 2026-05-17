import { Metadata } from "next"
import CronParserTool from "@/components/cron-parser/cron-parser-tool"

export const metadata: Metadata = {
  title: "Cron Expression Parser | Nilanjan Deb Tools",
  description: "Parse cron expressions into human-readable descriptions with next run times.",
}

export default function CronParserPage() {
  return (
    <main className="container px-4 md:px-6 mx-auto py-10">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Cron Expression Parser</h1>
      <p className="text-muted-foreground mb-6">
        Parse cron expressions into plain English. See next scheduled run times.
      </p>
      <CronParserTool />
    </main>
  )
}
