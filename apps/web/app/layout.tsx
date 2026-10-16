import type { Metadata } from "next";
import {
  Geist_Mono,
  Instrument_Sans,
  Instrument_Serif,
} from "next/font/google";

import "@workspace/ui/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@workspace/ui/lib/utils";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { ScrollArea } from "@workspace/ui/components/scroll-area";

export const metadata: Metadata = {
  title: { default: "Async Academy", template: "%s - Async Academy" },
};

const instrumentSerifHeading = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-heading",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        instrumentSans.variable,
        instrumentSerifHeading.variable
      )}
    >
      <body>
        <ThemeProvider>
          <a
            href="#main-content"
            className="sr-only z-[100] rounded-sm bg-background px-4 py-2 text-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
          >
            Skip to content
          </a>
          <div className="flex h-dvh flex-col">
            <SiteHeader />
            <div className="flex min-h-0 flex-1">
              <AppSidebar />
              <main id="main-content" className="min-w-0 flex-1">
                <ScrollArea className="h-full">{children}</ScrollArea>
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
