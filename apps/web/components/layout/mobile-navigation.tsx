"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import { SidebarNavigation } from "@/components/layout/app-sidebar";

export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  if (!pathname.startsWith("/js/lessons/")) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            className="rounded-none bg-transparent p-0 text-muted-foreground shadow-none transition-colors hover:bg-transparent hover:text-primary active:translate-y-0 lg:hidden"
            aria-label="Open lesson navigation"
          />
        }
      >
        <Menu aria-hidden="true" className="size-5" />
      </SheetTrigger>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="w-[min(19rem,85vw)] gap-0 p-0"
      >
        <SheetTitle className="sr-only">Lesson navigation</SheetTitle>
        <SheetDescription className="sr-only">
          Browse the Async Academy curriculum.
        </SheetDescription>
        <div className="mx-4 mt-6 flex h-10 shrink-0 items-center justify-between border-b sm:mx-6">
          <span className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
            Lessons
          </span>
          <SheetClose
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                className="size-5 rounded-none bg-transparent p-0 text-muted-foreground shadow-none transition-colors hover:bg-transparent hover:text-primary active:translate-y-0"
                aria-label="Close lesson navigation"
              />
            }
          >
            <X aria-hidden="true" className="size-5" />
          </SheetClose>
        </div>
        <ScrollArea autoHide className="min-h-0 flex-1">
          <div className="px-4 py-4 sm:px-6">
            <SidebarNavigation
              onNavigate={() => setOpen(false)}
              showLabel={false}
            />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
