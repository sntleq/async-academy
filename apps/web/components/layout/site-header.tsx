import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center border-b bg-primary px-8">
      <Link href="/" className="font-heading text-primary-foreground text-2xl">
        Async Academy
      </Link>
    </header>
  );
}