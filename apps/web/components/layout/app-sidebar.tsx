"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef } from "react";
import { cn } from "@workspace/ui/lib/utils";

const nav = [
  {
    title: "JS Basics",
    items: [
      { title: "Variables", href: "/lessons/js-basics/variables" },
      { title: "Objects & Arrays", href: "/lessons/js-basics/objects-arrays" },
      { title: "Functions", href: "/lessons/js-basics/functions" },
    ],
  },
  {
    title: "Design Patterns & jQuery",
    items: [
      { title: "Factory Pattern", href: "/lessons/design-patterns/factory" },
      { title: "Singleton Pattern", href: "/lessons/design-patterns/singleton" },
      { title: "jQuery Selectors", href: "/lessons/design-patterns/jquery-selectors" },
    ],
  },
  {
    title: "Modularization & Frontend",
    items: [
      { title: "CommonJS & AMD", href: "/lessons/modularization/commonjs-amd" },
      { title: "jQuery Events & AJAX", href: "/lessons/modularization/jquery-events" },
    ],
  },
  {
    title: "Backbone.js",
    items: [
      { title: "Views", href: "/lessons/backbone/views" },
      { title: "Models & Collections", href: "/lessons/backbone/models-collections" },
      { title: "Routers", href: "/lessons/backbone/routers" },
    ],
  },
  {
    title: "Node.js",
    items: [
      { title: "HTTP Module", href: "/lessons/nodejs/http-module" },
      { title: "File System", href: "/lessons/nodejs/file-system" },
      { title: "npm & Events", href: "/lessons/nodejs/npm-events" },
    ],
  },
  {
    title: "Deployment",
    items: [
      { title: "Client-Server Architecture", href: "/lessons/deployment/client-server" },
      { title: "npm Package Deployment", href: "/lessons/deployment/npm-package" },
    ],
  },
];

const SCROLL_KEY = "sidebar-scroll-pos";

export function AppSidebar() {
  const pathname = usePathname();
  const scrollRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const saved = sessionStorage.getItem(SCROLL_KEY);
    if (saved) el.scrollTop = Number(saved);

    const onScroll = () => sessionStorage.setItem(SCROLL_KEY, String(el.scrollTop));
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [pathname]);

  return (
    <aside
      ref={scrollRef}
      className="sticky top-16 hidden h-[calc(100vh-12rem)] w-64 shrink-0 overflow-y-auto border-r px-8 lg:block scrollbar-none my-16 scroll-fade"
    >
      <nav className="flex flex-col gap-6">
        {nav.map((group) => (
          <div key={group.title}>
            <p className="mb-2 text-xl font-heading font-medium">
              {group.title}
            </p>
            <ul className="flex flex-col gap-1">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "block rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      pathname === item.href &&
                      "bg-accent font-medium text-foreground"
                    )}
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}