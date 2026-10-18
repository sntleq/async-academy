"use client";

import { useEffect, useState } from "react";
import { cn } from "@workspace/ui/lib/utils";

interface Heading {
  id: string;
  text: string;
  level: number;
  href: string;
  spaced: boolean;
}

export function TableOfContents({ containerId }: { containerId: string }) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const elements = Array.from(
      container.querySelectorAll("h2, h3")
    ) as HTMLElement[];
    const scrollRoot = container.closest<HTMLElement>(
      '[data-slot="scroll-area-viewport"]'
    );
    const bottomHeading = elements.find(
      (el) => el.dataset.tocActiveAtBottom === "true"
    );

    setHeadings(
      elements.map((el) => ({
        id: el.id,
        text: el.dataset.tocLabel ?? el.textContent ?? "",
        level: el.tagName === "H2" ? 2 : 3,
        href: el.dataset.tocHref ?? `#${el.id}`,
        spaced: Boolean(el.dataset.tocSpace),
      }))
    );

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { root: scrollRoot, rootMargin: "0px 0px -80% 0px" }
    );

    elements.forEach((el) => observer.observe(el));

    function updateBottomHeading() {
      if (!bottomHeading) return;

      const isAtBottom = scrollRoot
        ? scrollRoot.scrollTop + scrollRoot.clientHeight >=
          scrollRoot.scrollHeight - 48
        : window.scrollY + window.innerHeight >=
          document.documentElement.scrollHeight - 48;

      if (isAtBottom) setActiveId(bottomHeading.id);
    }

    const scrollTarget = scrollRoot ?? window;
    scrollTarget.addEventListener("scroll", updateBottomHeading, {
      passive: true,
    });
    updateBottomHeading();

    return () => {
      observer.disconnect();
      scrollTarget.removeEventListener("scroll", updateBottomHeading);
    };
  }, [containerId]);

  if (headings.length === 0) return null;

  return (
    <nav className="sticky top-0 hidden max-h-[calc(100dvh-4rem)] w-72 shrink-0 flex-col gap-2 overflow-y-auto py-16 text-sm xl:flex">
      <p className="mb-2 font-heading text-2xl font-medium">On This Page</p>
      {headings.map((heading) => (
        <a
          key={heading.id}
          href={heading.href}
          onClick={() => setActiveId(heading.id)}
          className={cn(
            "text-muted-foreground transition-colors hover:text-primary",
            heading.level === 3 && "pl-4",
            heading.spaced && "mt-2",
            activeId === heading.id && "font-medium text-primary"
          )}
        >
          {heading.text}
        </a>
      ))}
    </nav>
  );
}
