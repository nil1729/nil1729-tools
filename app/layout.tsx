import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css"

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  metadataBase: new URL("https://tools.nilanjandeb.com"),
  title: {
    default: "Developer Tools — Nilanjan Deb",
    template: "%s | Nilanjan Deb Tools",
  },
  description:
    "Clean, ad-free developer tools. JSON linter, formatter, and more — built by Nilanjan Deb.",
  authors: [{ name: "Nilanjan Deb", url: "https://nilanjandeb.com" }],
  creator: "Nilanjan Deb",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://tools.nilanjandeb.com",
    siteName: "Nilanjan Deb Tools",
    title: "Developer Tools — Nilanjan Deb",
    description: "Clean, ad-free developer tools built by Nilanjan Deb.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Nilanjan Deb Tools" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Developer Tools — Nilanjan Deb",
    description: "Clean, ad-free developer tools built by Nilanjan Deb.",
    images: ["/og-image.jpg"],
    creator: "@nil1729",
  },
  alternates: { canonical: "https://tools.nilanjandeb.com" },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0a0a0a" media="(prefers-color-scheme: dark)" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans min-h-screen flex flex-col`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="nilanjan-theme">
          <Navigation />
          <main className="flex-1 pt-16">
            {children}
          </main>
          <Footer />
          <Toaster richColors closeButton />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
