import Link from "next/link"

export default function NotFound() {
  return (
    <div className="container px-4 mx-auto py-24 flex flex-col items-center text-center gap-4">
      <h1 className="text-2xl font-bold">Page Not Found</h1>
      <p className="text-muted-foreground">The page you are looking for does not exist.</p>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-lg border border-transparent bg-primary px-4 h-8 text-sm font-medium text-primary-foreground transition-all hover:opacity-90"
      >
        Back to Tools
      </Link>
    </div>
  )
}
