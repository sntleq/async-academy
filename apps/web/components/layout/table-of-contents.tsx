"use client";

import { useEffect, useState } from "react";
import { cn } from "@workspace/ui/lib/utils";

interface Heading {
  id: string;
  text: string;
  level: number;
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

    setHeadings(
      elements.map((el) => ({
        id: el.id,
        text: el.textContent ?? "",
        level: el.tagName === "H2" ? 2 : 3,
      }))
    );

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "0px 0px -80% 0px" }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [containerId]);

  if (headings.length === 0) return null;

  return (
    <nav className="sticky top-16 hidden max-h-[calc(100vh-4rem)] w-64 shrink-0 flex-col gap-2 overflow-y-auto py-16 text-sm xl:flex">
      <p className="font-heading text-2xl font-medium mb-2">On This Page</p>
      {headings.map((heading) => (
        <a
          key={heading.id}
          href={`#${heading.id}`}
          className={cn(
          "text-muted-foreground transition-colors hover:text-foreground",
          heading.level === 3 && "pl-4",
          activeId === heading.id && "font-medium text-foreground"
          )}
        >
          {heading.text}
        </a>
        ))}
</nav>
);
}