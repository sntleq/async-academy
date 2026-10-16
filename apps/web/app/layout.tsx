import { Geist, Geist_Mono, Instrument_Sans, Instrument_Serif } from "next/font/google"

import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@workspace/ui/lib/utils"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SiteHeader } from "@/components/layout/site-header"

const instrumentSerifHeading = Instrument_Serif({subsets:['latin'],weight:['400'],variable:'--font-heading'});

const instrumentSans = Instrument_Sans({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", instrumentSans.variable, instrumentSerifHeading.variable)}
    >
    <body>
    <ThemeProvider>
      <SiteHeader />
      <div className="flex">
        <AppSidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </ThemeProvider>
    </body>
    </html>
  )
}