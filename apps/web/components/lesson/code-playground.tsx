"use client";

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { Play } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { getRunner, type LogLevel, type OutputLine } from "@/lib/runner";
import { HighlightedCode } from "@/components/lesson/highlighted-code";

const MAX_LINES = 500;
const EDITOR_LINE_HEIGHT = 24;
const EDITOR_VERTICAL_PADDING = 32;
const EDITOR_MAX_HEIGHT = 384;
const OUTPUT_LINE_HEIGHT = 24;
const OUTPUT_VERTICAL_PADDING = 10;
const OUTPUT_MAX_HEIGHT = 160;

// Shared by the highlight layer, the textarea and the line numbers so they line up exactly
const editorText = "font-mono text-sm leading-6";

function findContainerEnd(value: string, start: number) {
  const expected: string[] = [];
  let quote = "";

  for (let index = start; index < value.length; index++) {
    const char = value[index];
    if (quote) {
      if (char === "\\") index++;
      else if (char === quote) quote = "";
      continue;
    }

    if (char === "'" || char === '"' || char === "`") {
      quote = char;
      continue;
    }

    if (char === "[" || char === "{") {
      expected.push(char === "[" ? "]" : "}");
    } else if (char === "]" || char === "}") {
      if (expected.pop() !== char) return -1;
      if (expected.length === 0) return index;
    }
  }

  return -1;
}

function splitTopLevel(value: string, separator: string) {
  const parts: string[] = [];
  const expected: string[] = [];
  let quote = "";
  let start = 0;

  for (let index = 0; index < value.length; index++) {
    const char = value[index];
    if (quote) {
      if (char === "\\") index++;
      else if (char === quote) quote = "";
      continue;
    }

    if (char === "'" || char === '"' || char === "`") {
      quote = char;
      continue;
    }

    if (char === "[" || char === "{" || char === "(") {
      expected.push(char === "[" ? "]" : char === "{" ? "}" : ")");
    } else if (char === "]" || char === "}" || char === ")") {
      expected.pop();
    } else if (char === separator && expected.length === 0) {
      parts.push(value.slice(start, index));
      start = index + 1;
    }
  }

  parts.push(value.slice(start));
  return parts;
}

function formatPreviewValue(value: string, nested = false): string {
  const trimmed = value.trim();
  const startsWithContainer = trimmed[0] === "[" || trimmed[0] === "{";
  const end = startsWithContainer ? findContainerEnd(trimmed, 0) : -1;

  if (startsWithContainer && end === trimmed.length - 1) {
    const body = trimmed.slice(1, -1);
    if (trimmed[0] === "[") {
      if (!body.trim()) return "[]";
      const values = splitTopLevel(body, ",");
      if (!values.at(-1)?.trim()) values.pop();
      return `[ ${values.map((item) => formatPreviewValue(item, true)).join(", ")} ]`;
    }

    if (!body.trim()) return "{}";
    const entries = splitTopLevel(body, ",");
    if (!entries.at(-1)?.trim()) entries.pop();
    return `{ ${entries
      .map((entry) => {
        const parts = splitTopLevel(entry, ":");
        if (parts.length < 2) return entry.trim();

        const key = (parts[0] ?? "")
          .trim()
          .replace(/^(?:"(.*)"|'(.*)')$/s, "$1$2");
        return `${key}: ${formatPreviewValue(parts.slice(1).join(":"), true)}`;
      })
      .join(", ")} }`;
  }

  if (nested && trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try {
      return `'${JSON.parse(trimmed)}'`;
    } catch {
      return trimmed;
    }
  }

  return trimmed;
}

function formatPreviewLine(value: string) {
  const trimmed = value.trim();
  const instanceOutput = trimmed.match(/^[A-Z][\w$]*\s+(\{[\s\S]*\})$/);
  const instanceObject = instanceOutput?.[1];
  if (instanceOutput && instanceObject) {
    const typeName = trimmed.slice(0, trimmed.indexOf(" "));
    const isSpecialType =
      typeName === "Date" ||
      typeName === "Map" ||
      typeName === "Set" ||
      typeName.endsWith("Error");

    if (
      !isSpecialType &&
      findContainerEnd(instanceObject, 0) === instanceObject.length - 1
    ) {
      // The worker prints enumerable properties, without Node's class-name prefix.
      return formatPreviewValue(instanceObject);
    }
  }

  const fullContainer = trimmed[0] === "[" || trimmed[0] === "{";
  const end = fullContainer ? findContainerEnd(trimmed, 0) : -1;
  if (fullContainer && end === trimmed.length - 1) {
    return formatPreviewValue(trimmed);
  }

  let result = "";
  let index = 0;
  while (index < value.length) {
    const char = value[index];
    if (char === "'" || char === '"' || char === "`") {
      const quote = char;
      result += char;
      index++;
      while (index < value.length) {
        const current = value[index++];
        result += current;
        if (current === "\\" && index < value.length) result += value[index++];
        else if (current === quote) break;
      }
      continue;
    }

    if (char === "[" || char === "{") {
      const containerEnd = findContainerEnd(value, index);
      if (containerEnd !== -1) {
        const container = value.slice(index, containerEnd + 1);
        const contents = container.slice(1, -1);
        if (contents.includes(",") || contents.includes('"')) {
          result += formatPreviewValue(container);
          index = containerEnd + 1;
          continue;
        }
      }
    }

    result += char;
    index++;
  }

  return result;
}

// Lookup object instead of if/else: level -> text color
const levelClasses: Record<LogLevel, string> = {
  log: "",
  info: "",
  warn: "text-amber-700 dark:text-amber-400",
  error: "text-destructive",
};

interface CodePlaygroundProps {
  code: string;
  title?: string;
  // Shown before the first run so the page isn't empty; replaced by real output.
  output?: string;
}

export function CodePlayground({
  code,
  title = "Example",
  output,
}: CodePlaygroundProps) {
  const original = code.trim();
  const [source, setSource] = useState(original);
  const [lines, setLines] = useState<OutputLine[] | null>(null);
  const [running, setRunning] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorViewportRef = useRef<HTMLDivElement>(null);
  const pendingSelection = useRef<[number, number] | null>(null);
  const releaseTab = useRef(false);

  const revealCaret = useCallback(
    (textarea: HTMLTextAreaElement | null = textareaRef.current) => {
      const viewport = editorViewportRef.current;
      if (!textarea || !viewport) return;

      const caretIndex =
        textarea.selectionDirection === "backward"
          ? textarea.selectionStart
          : textarea.selectionEnd;
      const lineIndex =
        textarea.value.slice(0, caretIndex).split("\n").length - 1;
      const caretTop =
        EDITOR_VERTICAL_PADDING / 2 + lineIndex * EDITOR_LINE_HEIGHT;
      const caretBottom = caretTop + EDITOR_LINE_HEIGHT;
      const visibleBottom =
        viewport.scrollTop +
        viewport.clientHeight -
        EDITOR_VERTICAL_PADDING / 2;

      if (caretTop < viewport.scrollTop) {
        viewport.scrollTop = caretTop;
      } else if (caretBottom > visibleBottom) {
        viewport.scrollTop =
          caretBottom - viewport.clientHeight + EDITOR_VERTICAL_PADDING / 2;
      }
    },
    []
  );

  // Fallback path only: apply the caret after React has written the new value
  useLayoutEffect(() => {
    const selection = pendingSelection.current;
    if (!selection) return;
    const textarea = textareaRef.current;
    textarea?.setSelectionRange(selection[0], selection[1]);
    pendingSelection.current = null;
    revealCaret(textarea);
  }, [source]);

  // Replace [from, to) with text, then put the selection at [selStart, selEnd]
  function edit(
    from: number,
    to: number,
    text: string,
    selStart: number,
    selEnd = selStart
  ) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.setSelectionRange(from, to);
    const done = text
      ? document.execCommand("insertText", false, text)
      : document.execCommand("delete");

    if (done) {
      textarea.setSelectionRange(selStart, selEnd);
      requestAnimationFrame(() => revealCaret(textarea));
      return;
    }

    pendingSelection.current = [selStart, selEnd];
    setSource(textarea.value.slice(0, from) + text + textarea.value.slice(to));
  }

  const preview: OutputLine[] | null = output
    ? output
        .trim()
        .split("\n")
        .filter(Boolean)
        .map(
          (text): OutputLine => ({
            level: /^\w*Error:/.test(text) ? "error" : "log",
            text: formatPreviewLine(text),
          })
        )
    : null;
  const shown = lines ?? preview;
  const isPreview = lines === null && preview !== null;
  const edited = source !== original;
  const lineCount = source.split("\n").length;

  async function run() {
    const runner = getRunner("javascript");
    if (!runner || running) return;

    setRunning(true);
    setLines([]);
    await runner.run(source, (line) =>
      setLines((prev) => {
        const current = prev ?? [];
        return current.length >= MAX_LINES ? current : [...current, line];
      })
    );
    setRunning(false);
  }

  function reset() {
    setSource(original);
    setLines(null);
  }

  const PAIRS: Record<string, string> = {
    "(": ")",
    "[": "]",
    "{": "}",
    '"': '"',
    "'": "'",
    "`": "`",
  };
  const CLOSERS = new Set(Object.values(PAIRS));

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    const textarea = event.currentTarget;
    const { selectionStart: start, selectionEnd: end, value } = textarea;
    const { key } = event;
    const hasSelection = start !== end;
    const prev = value[start - 1] ?? "";
    const next = value[end] ?? "";
    const line = value.slice(value.lastIndexOf("\n", start - 1) + 1, start);

    if ((event.metaKey || event.ctrlKey) && key === "Enter") {
      event.preventDefault();
      void run();
      return;
    }

    // Escape releases the Tab trap until the next non-Tab key
    if (key === "Escape") {
      releaseTab.current = true;
      return;
    }
    if (key === "Tab" && releaseTab.current) return;
    if (key !== "Tab" && key !== "Shift") releaseTab.current = false;

    // Leave shortcuts alone (Ctrl+Alt is AltGr on some keyboards)
    if (event.metaKey || (event.ctrlKey && !event.altKey)) return;

    // Typing a closer that's already there: step over it
    if (CLOSERS.has(key) && !hasSelection && next === key) {
      event.preventDefault();
      textarea.setSelectionRange(start + 1, start + 1);
      return;
    }

    // Typing an opener: insert the pair, or wrap the selection
    const close = PAIRS[key];
    if (close) {
      const isQuote = key === close;
      if (!hasSelection) {
        const skip =
          /\w/.test(next) || // don't pair in front of existing text
          (isQuote && /\w/.test(prev)) || // don't / it's
          (isQuote && line.includes("//")); // apostrophes in line comments
        if (skip) return;
      }
      event.preventDefault();
      edit(
        start,
        end,
        key + value.slice(start, end) + close,
        start + 1,
        end + 1
      );
      return;
    }

    // Backspace between an empty pair removes both characters
    if (key === "Backspace" && !hasSelection && PAIRS[prev] === next) {
      event.preventDefault();
      edit(start - 1, end + 1, "", start - 1);
      return;
    }

    // Tab: insert two spaces, or indent every line touched by the selection.
    // Shift+Tab: dedent the current line or every selected line.
    if (key === "Tab") {
      event.preventDefault();

      if (!hasSelection && !event.shiftKey) {
        edit(start, end, "  ", start + 2);
        return;
      }

      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      // A selection ending right after a newline shouldn't include the next line
      const searchFrom =
        hasSelection && value[end - 1] === "\n" ? end - 1 : end;
      const lineEnd = value.indexOf("\n", searchFrom);
      const blockEnd = lineEnd === -1 ? value.length : lineEnd;

      const block = value.slice(lineStart, blockEnd);
      const changed = event.shiftKey
        ? block.replace(/^ {1,2}/gm, "")
        : block.replace(/^(?=.)/gm, "  "); // skip empty lines

      if (hasSelection) {
        edit(
          lineStart,
          blockEnd,
          changed,
          lineStart,
          lineStart + changed.length
        );
      } else {
        const removed = block.length - changed.length; // single line, so this is exact
        edit(
          lineStart,
          blockEnd,
          changed,
          Math.max(lineStart, start - removed)
        );
      }
      return;
    }

    // Enter: keep indentation, add a level after an opener, split {|} onto three lines
    if (key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      const indent = /^\s*/.exec(line)?.[0] ?? "";
      const opens = /[{(\[]$/.test(line.trimEnd());

      if (opens && PAIRS[prev] === next) {
        const caret = start + 1 + indent.length + 2;
        edit(start, end, "\n" + indent + "  \n" + indent, caret);
      } else {
        const extra = opens ? "  " : "";
        edit(
          start,
          end,
          "\n" + indent + extra,
          start + 1 + indent.length + extra.length
        );
      }
    }
  }

  return (
    <figure className="my-6 overflow-hidden rounded-lg border">
      <figcaption className="flex items-center justify-between gap-2 border-b bg-muted px-4 py-2">
        <span className="text-sm font-medium">{title}</span>
        <span className="font-mono text-xs text-muted-foreground">JS</span>
      </figcaption>

      <ScrollArea
        autoHide
        orientation="both"
        viewportRef={editorViewportRef}
        className="max-h-[min(24rem,60dvh)] w-full"
        style={{
          height: Math.min(
            lineCount * EDITOR_LINE_HEIGHT + EDITOR_VERTICAL_PADDING,
            EDITOR_MAX_HEIGHT
          ),
        }}
      >
        <div className="flex w-max min-w-full bg-background focus-within:ring-1 focus-within:ring-ring/50 focus-within:ring-inset">
          {/* Keep the gutter in the same scroll viewport as the code. */}
          <pre
            aria-hidden
            className={cn(
              editorText,
              "shrink-0 border-r bg-muted/30 py-4 pr-3 pl-4 text-right text-muted-foreground/60 select-none"
            )}
          >
            {Array.from({ length: lineCount }, (_, i) => i + 1).join("\n")}
          </pre>

          {/* Highlight layer and textarea share one grid cell, so the textarea sits exactly on top. */}
          <div className="grid w-max shrink-0">
            <pre
              aria-hidden
              className={cn(
                editorText,
                "pointer-events-none col-start-1 row-start-1 p-4 whitespace-pre"
              )}
            >
              <HighlightedCode code={source} />
            </pre>
            <textarea
              ref={textareaRef}
              onFocus={() => {
                releaseTab.current = false;
              }}
              value={source}
              onChange={(event) => {
                const textarea = event.currentTarget;
                setSource(textarea.value);
                requestAnimationFrame(() => revealCaret(textarea));
              }}
              onKeyDown={handleKeyDown}
              onKeyUp={(event) => revealCaret(event.currentTarget)}
              rows={1}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              wrap="off"
              aria-label={`${title} code editor`}
              className={cn(
                editorText,
                "col-start-1 row-start-1 h-full w-full resize-none overflow-hidden bg-transparent p-4 whitespace-pre text-transparent caret-foreground outline-none selection:bg-primary/25"
              )}
            />
          </div>
        </div>
      </ScrollArea>

      <div className="border-t bg-muted/50 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            {shown === null ? "Run code to see output" : "Output"}
          </p>
          <span className="flex items-center gap-2">
            {(edited || lines !== null) && (
              <button
                type="button"
                onClick={reset}
                className="rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-primary"
              >
                Reset
              </button>
            )}
            <Button
              type="button"
              onClick={run}
              disabled={running}
              title="Run (Ctrl/Cmd + Enter)"
            >
              <Play aria-hidden="true" data-icon="inline-start" />
              {running ? "Running…" : "Run"}
            </Button>
          </span>
        </div>

        {/* Always mounted so screen readers announce output when it appears */}
        <div aria-live="polite" className={cn(shown !== null && "mt-2")}>
          {shown !== null &&
            (shown.length === 0 ? (
              <p className={cn(editorText, "text-muted-foreground")}>
                {running ? "Running…" : "(no output)"}
              </p>
            ) : (
              <ScrollArea
                autoHide
                orientation="both"
                className="max-h-40 w-full"
                style={{
                  height: Math.min(
                    shown.length * OUTPUT_LINE_HEIGHT + OUTPUT_VERTICAL_PADDING,
                    OUTPUT_MAX_HEIGHT
                  ),
                }}
              >
                <div className="w-max min-w-full pr-2.5 pb-2.5">
                  {shown.map((line, index) => (
                    <pre
                      key={index}
                      className={cn(
                        editorText,
                        "whitespace-pre",
                        levelClasses[line.level],
                        isPreview &&
                          (line.level === "log" || line.level === "info") &&
                          "text-muted-foreground"
                      )}
                    >
                      {line.text}
                    </pre>
                  ))}
                </div>
              </ScrollArea>
            ))}
        </div>
      </div>
    </figure>
  );
}
