import { cn } from "@workspace/ui/lib/utils";
import { tokenizeJs, type TokenType } from "@/lib/highlight/tokenize-js";

// Lookup object: token type -> classes. Keywords use the theme's primary color so the
// editor matches the rest of the site; the rest have light and dark variants.
export const tokenClasses: Record<TokenType, string> = {
  keyword: "text-primary",
  string: "text-emerald-700 dark:text-emerald-400",
  number: "text-amber-700 dark:text-amber-400",
  literal: "text-orange-700 dark:text-orange-400",
  builtin: "text-sky-700 dark:text-sky-400",
  function: "text-violet-700 dark:text-violet-400",
  comment: "text-zinc-500",
  punct: "text-foreground/70",
  plain: "",
};

export function HighlightedCode({ code }: { code: string }) {
  return (
    <>
      {tokenizeJs(code).map((token, index) => (
        <span key={index} className={cn(tokenClasses[token.type])}>
          {token.text}
        </span>
      ))}
      {/* Trailing newline so a final empty line still takes up space */}
      {"\n"}
    </>
  );
}
