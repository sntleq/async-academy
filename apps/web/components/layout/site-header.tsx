"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { Code2, LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { signOut } from "firebase/auth";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { getFirebaseClient } from "@/lib/firebase/client";

const subscribeToNothing = () => () => {};
const getMountedSnapshot = () => true;
const getServerMountedSnapshot = () => false;

export function SiteHeader() {
  const { resolvedTheme, setTheme } = useTheme();
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const mounted = useSyncExternalStore(
    subscribeToNothing,
    getMountedSnapshot,
    getServerMountedSnapshot
  );

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-background/95 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="flex h-full min-w-0 items-center gap-1 sm:gap-2">
        <MobileNavigation />
        <Link
          href="/"
          className="flex h-full items-center font-heading text-xl leading-none tracking-tight whitespace-nowrap text-primary sm:text-2xl"
        >
          Async Academy<span className="text-primary">.</span>
        </Link>
        <Link
          href="/js"
          className={cn(
            "ml-2 flex h-full items-center px-1 text-xs leading-none font-medium whitespace-nowrap transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring sm:ml-4 sm:px-2 sm:text-sm",
            pathname === "/js" && "text-primary"
          )}
        >
          <span className="sm:hidden">Learn</span>
          <span className="hidden sm:inline">Learn JavaScript</span>
        </Link>
        <Link
          href="/playground"
          aria-label="Open the Coding Playground"
          title="Coding Playground"
          className={cn(
            "ml-1 flex h-full items-center gap-1 px-1 text-xs leading-none font-medium whitespace-nowrap transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring sm:ml-2 sm:px-2 sm:text-sm",
            pathname === "/playground" && "text-primary"
          )}
        >
          <Code2 aria-hidden="true" className="size-3.5 sm:hidden" />
          <span className="sm:hidden">Play</span>
          <span className="hidden lg:inline">Coding Playground</span>
          <span className="hidden sm:inline lg:hidden">Playground</span>
        </Link>
      </div>
      <div className="ml-2 flex shrink-0 items-center gap-1 sm:gap-3">
        <Button
          variant="ghost"
          size="icon-xs"
          className="rounded-none bg-transparent p-0 text-muted-foreground shadow-none transition-colors hover:bg-transparent hover:text-primary active:translate-y-0"
          aria-label={
            mounted
              ? `Switch to ${isDark ? "light" : "dark"} mode`
              : "Toggle color theme"
          }
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          {isDark ? (
            <Sun aria-hidden="true" className="size-5" />
          ) : (
            <Moon aria-hidden="true" className="size-5" />
          )}
        </Button>
        {!authLoading && (user ? (
          <>
            <span className="hidden max-w-36 truncate text-xs text-muted-foreground sm:block">
              {user.email}
            </span>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                const client = getFirebaseClient();
                if (client) void signOut(client.auth);
              }}
            >
              <LogOut aria-hidden="true" data-icon="inline-start" />
              Sign out
            </Button>
          </>
        ) : (
          <Button nativeButton={false} render={<Link href="/login" />}>
            Sign in
          </Button>
        ))}
      </div>
    </header>
  );
}
