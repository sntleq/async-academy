"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Curriculum } from "@/lib/lessons";

const nav = Curriculum.getInstance().getUnits();

const SCROLL_KEY = "sidebar-scroll-pos";

export function SidebarNavigation({
  onNavigate,
  showLabel = true,
}: {
  onNavigate?: () => void;
  showLabel?: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-8">
      {showLabel && (
        <p className="border-b pb-4 text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
          Lessons
        </p>
      )}
      {nav.map((group) => (
        <div key={group.title}>
          <p className="mb-3 font-heading text-2xl">{group.title}</p>
          <ul className="flex flex-col gap-1">
            {group.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "block rounded-md px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-primary dark:hover:bg-accent",
                    pathname === item.href &&
                      "bg-accent font-medium text-primary hover:bg-accent dark:bg-muted dark:hover:bg-muted"
                  )}
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = scrollRef.current?.querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]'
    );
    if (!el) return;

    const saved = sessionStorage.getItem(SCROLL_KEY);
    if (saved) el.scrollTop = Number(saved);

    const onScroll = () =>
      sessionStorage.setItem(SCROLL_KEY, String(el.scrollTop));
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [pathname]);

  if (!pathname.startsWith("/js/lessons/")) return null;

  return (
    <aside className="hidden w-72 shrink-0 border-r lg:block">
      <div ref={scrollRef} className="h-full">
        <ScrollArea autoHide className="h-full">
          <div className="px-4 py-8 sm:px-6 lg:px-8">
            <SidebarNavigation />
          </div>
        </ScrollArea>
      </div>
    </aside>
  );
}
