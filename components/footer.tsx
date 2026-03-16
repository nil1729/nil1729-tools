import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t mt-auto py-6">
      <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
        <p>
          Built by{" "}
          <Link
            href="https://nilanjandeb.com"
            className="hover:text-foreground transition-colors underline underline-offset-4"
            target="_blank"
            rel="noopener noreferrer"
          >
            Nilanjan Deb
          </Link>
        </p>
        <p>No ads. No tracking. Just tools.</p>
      </div>
    </footer>
  )
}
