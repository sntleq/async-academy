import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Page not found - Async Academy",
};

export default function NotFound() {
  return (
    <section
      aria-labelledby="not-found-title"
      className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-6xl flex-col items-center justify-center px-5 py-16 text-center sm:px-8 lg:px-12"
    >
      <p className="font-heading text-[clamp(9rem,28vw,20rem)] leading-[0.72] tracking-[-0.08em] text-primary">
        404
      </p>
      <h1
        id="not-found-title"
        className="mt-10 font-heading text-4xl leading-tight tracking-tight sm:text-5xl"
      >
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-base leading-7 text-muted-foreground">
        The link may be outdated, or the address may be incorrect.
      </p>
      <Link
        href="/js"
        className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Go to the JavaScript overview
      </Link>
    </section>
  );
}
