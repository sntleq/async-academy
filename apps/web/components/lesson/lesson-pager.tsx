"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Curriculum, type Lesson } from "@/lib/lessons";

const linkClass =
  "group flex flex-col rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-primary";
const pagerLinkClass = `${linkClass} max-w-[48%]`;

export function LessonBackLink({ lesson }: { lesson: Lesson }) {
  return (
    <Link href={lesson.href} className={`${linkClass} w-fit`}>
      <span className="flex items-center gap-1 text-xs text-muted-foreground transition-colors group-hover:text-primary">
        <ChevronLeft aria-hidden="true" className="size-4" />
        Go back
      </span>
      <span className="pl-5 font-heading text-xl leading-tight group-hover:text-primary">
        {lesson.title}
      </span>
    </Link>
  );
}

export function LessonNextLink({
  lesson,
  label = "Next",
}: {
  lesson: Lesson;
  label?: string;
}) {
  return (
    <Link href={lesson.href} className={`${linkClass} w-fit items-end text-right`}>
      <span className="flex items-center gap-1 text-xs text-muted-foreground transition-colors group-hover:text-primary">
        {label}
        <ChevronRight aria-hidden="true" className="size-4" />
      </span>
      <span className="pr-5 font-heading text-xl leading-tight group-hover:text-primary">
        {lesson.title}
      </span>
    </Link>
  );
}

export function LessonPagerButton({
  label,
  title,
  direction,
  disabled = false,
  onClick,
}: {
  label: string;
  title: string;
  direction: "previous" | "next";
  disabled?: boolean;
  onClick: () => void;
}) {
  const isNext = direction === "next";
  const activeHover = disabled ? "" : "group-hover:text-primary";

  return (
    <button
      type="button"
      aria-label={`${label}: ${title}`}
      disabled={disabled}
      onClick={onClick}
      className={`${pagerLinkClass} ${isNext ? "items-end text-right" : ""} disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-inherit`}
    >
      <span
        className={`flex items-center gap-1 text-xs text-muted-foreground transition-colors ${activeHover}`}
      >
        {isNext ? null : <ChevronLeft aria-hidden="true" className="size-4" />}
        {label}
        {isNext ? <ChevronRight aria-hidden="true" className="size-4" /> : null}
      </span>
      <span className={`font-heading text-xl leading-tight ${isNext ? "pr-5" : "pl-5"} ${activeHover}`}>
        {title}
      </span>
    </button>
  );
}

export function LessonPager() {
  const pathname = usePathname();
  const { prev, next } = Curriculum.getInstance().getAdjacent(pathname);

  if (!prev && !next) return null;

  return (
    <nav className="mt-16 flex items-center justify-between gap-4 border-t pt-8">
      {prev ? (
        <Link href={prev.href} className={pagerLinkClass}>
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
        <Link href={next.href} className={`${pagerLinkClass} items-end text-right`}>
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
