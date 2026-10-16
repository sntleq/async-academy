"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Curriculum } from "@/lib/lessons";

const linkClass =
  "group flex max-w-[48%] flex-col rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-primary";

export function LessonPager() {
  const pathname = usePathname();
  const { prev, next } = Curriculum.getInstance().getAdjacent(pathname);

  if (!prev && !next) return null;

  return (
    <nav className="mt-16 flex items-center justify-between gap-4 border-t pt-8">
      {prev ? (
        <Link href={prev.href} className={linkClass}>
          <span className="flex items-center gap-1 text-xs text-muted-foreground transition-colors group-hover:text-primary">
            <ChevronLeft aria-hidden="true" className="size-4" />
            Previous
          </span>
          <span className="pl-5 font-heading text-xl leading-tight group-hover:text-primary">
            {prev.title}
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link href={next.href} className={`${linkClass} items-end text-right`}>
          <span className="flex items-center gap-1 text-xs text-muted-foreground transition-colors group-hover:text-primary">
            Next
            <ChevronRight aria-hidden="true" className="size-4" />
          </span>
          <span className="pr-5 font-heading text-xl leading-tight group-hover:text-primary">
            {next.title}
          </span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
