"use client";

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type FormEvent,
} from "react";
import { Play, Plus, Trash2 } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import {
  getRunner,
  type Files,
  type LogLevel,
  type OutputLine,
} from "@/lib/runner";
import { HighlightedCode } from "@/components/lesson/highlighted-code";
import { tokenizeJs } from "@/lib/highlight/tokenize-js";

const MAX_LINES = 500;
const EDITOR_LINE_HEIGHT = 24;
const EDITOR_VERTICAL_PADDING = 32;
const EDITOR_HORIZONTAL_GUTTER = 32;
const EDITOR_MAX_HEIGHT = 384;

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

// A single script has no real file name, so it gets a placeholder that is never shown
const SCRIPT = "script.js";
const CHALLENGE_RESULT_PREFIX = "__ASYNC_ACADEMY_CHALLENGE_RESULT__";

export interface ChallengeTestCase {
  args: unknown[];
  expected: unknown;
  hidden?: boolean;
  preserveArgs?: boolean;
}

// The variable the solution has to return, instead of returning an expression directly.
// Checked on the source code, because a variable inside a function can't be seen from
// outside it, so no test can read it.
export interface ReturnVariable {
  name: string;
  // Omit to accept const, let or var
  keyword?: "const" | "let" | "var";
}

export interface PlaygroundChallenge {
  functionName: string;
  testCases: ChallengeTestCase[];
  returnVariable?: ReturnVariable;
}

// What the harness reports for each test case
interface CaseResult {
  passed: boolean;
  // The returned value, formatted for display ("" when the function threw)
  actual: string;
  // "TypeError: ..." when the function threw
  error: string | null;
  // console output produced while this case ran
  logs: string[];
}

function isCaseResults(value: unknown): value is CaseResult[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        typeof item.passed === "boolean" &&
        typeof item.actual === "string" &&
        (item.error === null || typeof item.error === "string") &&
        Array.isArray(item.logs) &&
        item.logs.every((log: unknown) => typeof log === "string")
    )
  );
}

// Runs inside the worker, right after the learner's code. It sees the learner's
// functions as globals and reports one result per test case.
function createChallengeHarness({ functionName, testCases }: PlaygroundChallenge) {
  if (!/^[A-Za-z_$][\w$]*$/.test(functionName)) {
    throw new Error("Challenge functionName must be a JavaScript identifier");
  }

  return `
;(() => {
  const cases = ${JSON.stringify(testCases)};
  const candidate =
    typeof ${functionName} === "function" ? ${functionName} : undefined;
  const levels = ["log", "info", "warn", "error"];

  const show = (value) => {
    if (typeof value === "string") return JSON.stringify(value);
    if (typeof value === "undefined") return "undefined";
    if (typeof value === "bigint") return value + "n";
    if (typeof value === "function") return "[Function]";
    if (value !== null && typeof value === "object") {
      try { return JSON.stringify(value); } catch { return String(value); }
    }
    return Object.is(value, -0) ? "-0" : String(value);
  };

  // Arrays and objects are compared by content, because two separate arrays
  // are never === even when they hold the same items
  const same = (a, b) => {
    if (Object.is(a, b)) return true;
    if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    return (
      keysA.length === keysB.length &&
      keysA.every((key) => Object.prototype.hasOwnProperty.call(b, key) && same(a[key], b[key]))
    );
  };

  const results = cases.map(({ args, expected, preserveArgs = false }) => {
    const originalArgs = preserveArgs ? JSON.stringify(args) : null;
    // Collect console output per case, so one case's logs never end up in another's
    const logs = [];
    const original = {};
    levels.forEach((level) => {
      original[level] = console[level];
      console[level] = (...parts) =>
        logs.push(parts.map((part) => (typeof part === "string" ? part : show(part))).join(" "));
    });

    try {
      if (typeof candidate !== "function") {
        return { passed: false, actual: "", error: ${JSON.stringify(functionName)} + " is not a function", logs };
      }
      const actual = candidate(...args);
      const argsPreserved = originalArgs === null || JSON.stringify(args) === originalArgs;
      return {
        passed: same(actual, expected) && argsPreserved,
        actual: show(actual),
        error: argsPreserved ? null : "Input was mutated",
        logs,
      };
    } catch (error) {
      const text = error instanceof Error ? error.name + ": " + error.message : "Uncaught " + show(error);
      return { passed: false, actual: "", error: text, logs };
    } finally {
      levels.forEach((level) => { console[level] = original[level]; });
    }
  });

  console.log(${JSON.stringify(CHALLENGE_RESULT_PREFIX)} + JSON.stringify(results));
})();
`;
}

export function formatValue(value: unknown): string {
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "undefined") return "undefined";
  if (typeof value === "bigint") return `${value}n`;
  if (typeof value === "object" && value !== null) {
    const serialized = JSON.stringify(value);
    return serialized ? formatPreviewLine(serialized) : String(value);
  }
  return Object.is(value, -0) ? "-0" : String(value);
}

function formatExpectedValue(value: unknown): string {
  return typeof value === "string" ? value : formatValue(value);
}

function formatHarnessOutput(value: string) {
  // The worker JSON-encodes string return values; lesson output shows those raw.
  if (value.startsWith('"') && value.endsWith('"')) {
    try {
      const parsed: unknown = JSON.parse(value);
      if (typeof parsed === "string") return formatPreviewLine(parsed);
    } catch {
      // Leave non-JSON output unchanged and let the shared formatter handle it.
    }
  }

  return formatPreviewLine(value);
}

export function describeReturnVariable({ name, keyword }: ReturnVariable) {
  return `Store the result in a ${keyword ?? "variable"} named ${name} and return it`;
}

// True when the code declares the variable ("const name") AND returns it by name
// ("return name;"), so returning an expression directly doesn't count. It reads tokens,
// not raw text, so a declaration or return inside a comment or a string is ignored.
function returnsVariable(source: string, { name, keyword }: ReturnVariable) {
  const tokens = tokenizeJs(source).filter(
    (token) =>
      token.type !== "comment" &&
      !(token.type === "plain" && token.text.trim() === "")
  );
  const keywords = keyword ? [keyword] : ["const", "let", "var"];

  const declared = tokens.some(
    (token, index) =>
      token.type === "keyword" &&
      keywords.includes(token.text) &&
      tokens[index + 1]?.text === name
  );
  // "return total" must end the statement, so "return total + 1" is not accepted
  const returned = tokens.some(
    (token, index) =>
      token.type === "keyword" &&
      token.text === "return" &&
      tokens[index + 1]?.text === name &&
      [undefined, ";", "}"].includes(tokens[index + 2]?.text)
  );

  return declared && returned;
}

// Which part of the challenge the output panel is showing
type ChallengeView =
  | { kind: "summary" }
  | {
  kind: "case";
  index: number;
  total: number;
  input: string;
  expected: string;
  output: string;
  outputIsError: boolean;
  logs: string[];
  requirementError: string | null;
}
  | null;

// Show the first failed case, or the first case if only the source requirement fails.
// Show a summary only after every test and source requirement passes.
function buildChallengeReport(
  challenge: PlaygroundChallenge,
  source: string,
  results: CaseResult[] | null
): { lines: OutputLine[]; view: ChallengeView; passed: boolean } {
  const total = challenge.testCases.length;

  if (results === null || results.length !== total) {
    return {
      lines: [
        {
          level: "warn",
          text: "Tests could not finish. Check your code and try again.",
        },
      ],
      view: null,
      passed: false,
    };
  }

  const lines: OutputLine[] = [];
  const failedIndex = results.findIndex((result) => !result.passed);
  const requirementMet =
    !challenge.returnVariable || returnsVariable(source, challenge.returnVariable);

  if (failedIndex === -1 && requirementMet) {
    const view: ChallengeView = { kind: "summary" };
    lines.push({ level: "info", text: `Passed ${total} of ${total} test cases.` });
    return { lines, view, passed: true };
  }

  // If every test passed but the source requirement did not, show the first case
  // again so its output card can carry the requirement feedback.
  const index = failedIndex === -1 ? 0 : failedIndex;
  const testCase = challenge.testCases[index]!;
  const result = results[index]!;
  const requirementError =
    !requirementMet && challenge.returnVariable
      ? `Requirement not met: ${describeReturnVariable(challenge.returnVariable)}.`
      : null;

  const view: ChallengeView = {
    kind: "case",
    index,
    total,
    input: `${challenge.functionName}(${testCase.args
      .map(formatValue)
      .join(", ")})`,
    expected: formatExpectedValue(testCase.expected),
    output: result.error
      ? result.error
      : formatHarnessOutput(result.actual),
    outputIsError:
      !result.passed ||
      result.error !== null ||
      requirementError !== null,
    logs: result.logs.map(formatPreviewLine),
    requirementError,
  };

  return { lines, view, passed: false };
}

function ResultValueCard({
                           label,
                           value,
                           error = false,
                           requirementError,
                           logs = [],
                         }: {
  label: string;
  value: string;
  error?: boolean;
  requirementError?: string | null;
  logs?: string[];
}) {
  return (
    <div className="w-full min-w-0 rounded-md border bg-background px-3 py-2">
      <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <pre
        className={cn(
          editorText,
          "m-0 max-h-40 w-full overflow-auto whitespace-pre-wrap [overflow-wrap:anywhere]",
          error && "text-destructive"
        )}
      >
        {value}
      </pre>
      {requirementError && (
        <p className="mt-2 border-t pt-2 text-xs leading-5 text-destructive">
          {requirementError}
        </p>
      )}
      {logs.length > 0 && (
        <div className="mt-2 border-t pt-2">
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Console Output
          </p>
          <pre
            className={cn(
              editorText,
              "m-0 max-h-40 w-full overflow-auto whitespace-pre-wrap [overflow-wrap:anywhere]"
            )}
          >
            {logs.join("\n")}
          </pre>
        </div>
      )}
    </div>
  );
}

interface CodePlaygroundProps {
  // One script...
  code?: string;
  // ...or several files that import each other. `entry` is the one that runs
  // (the first file when omitted).
  files?: Files;
  entry?: string;
  // When set, other files stay visible as read-only context for a challenge.
  editableFile?: string;
  title?: string;
  // Shown before the first run so the page isn't empty; replaced by real output.
  output?: string;
  challenge?: PlaygroundChallenge;
  onChallengeResult?: (passed: boolean | null) => void;
  allowFileManagement?: boolean;
  maxFiles?: number;
  minEditorHeight?: number;
}

export function CodePlayground({
                                 code = "",
                                 files,
                                 entry,
                                 editableFile,
                                 title = "Example",
                                 output,
                                 challenge,
                                 onChallengeResult,
                                 allowFileManagement = false,
                                 maxFiles = 5,
                                 minEditorHeight = 0,
                               }: CodePlaygroundProps) {
  const isMulti = files !== undefined;
  const original: Files = files
    ? Object.fromEntries(
      Object.entries(files).map(([name, text]) => [name, text.trim()])
    )
    : { [SCRIPT]: code.trim() };
  const originalNames = Object.keys(original);
  const originalEntry = entry && entry in original ? entry : originalNames[0]!;

  const [sources, setSources] = useState<Files>(original);
  const [names, setNames] = useState(originalNames);
  const [activeName, setActiveName] = useState(originalEntry);
  const [entryName, setEntryName] = useState(originalEntry);
  const [newFileName, setNewFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const activeEntry = entryName in sources ? entryName : names[0]!;
  // The editor below always shows one file; these two stand in for "the" source
  const source = sources[activeName] ?? "";
  const isEditable = editableFile === undefined || activeName === editableFile;
  const setSource = (value: string) => {
    if (!isEditable) return;
    setSources((prev) => ({ ...prev, [activeName]: value }));
    onChallengeResult?.(null);
  };
  const [lines, setLines] = useState<OutputLine[] | null>(null);
  const [challengeView, setChallengeView] = useState<ChallengeView>(null);
  const [running, setRunning] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorViewportRef = useRef<HTMLDivElement>(null);
  const measureContextRef = useRef<CanvasRenderingContext2D | null>(null);
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
      const lineStart = textarea.value.lastIndexOf("\n", caretIndex - 1) + 1;
      const caretText = textarea.value.slice(lineStart, caretIndex);
      const textStyle = getComputedStyle(textarea);
      measureContextRef.current ??= document
        .createElement("canvas")
        .getContext("2d");
      if (measureContextRef.current) {
        measureContextRef.current.font = textStyle.font;
      }
      const caretTextWidth = measureContextRef.current
        ? measureContextRef.current.measureText(caretText).width
        : caretText.length * (Number.parseFloat(textStyle.fontSize) || 14) * 0.6;
      const textareaRect = textarea.getBoundingClientRect();
      const viewportRect = viewport.getBoundingClientRect();
      const caretRight =
        textareaRect.left -
        viewportRect.left +
        viewport.scrollLeft +
        (Number.parseFloat(textStyle.paddingLeft) || 0) +
        caretTextWidth;
      const visibleRight = viewport.scrollLeft + viewport.clientWidth;

      if (caretRight + EDITOR_HORIZONTAL_GUTTER > visibleRight) {
        viewport.scrollLeft = Math.max(
          0,
          caretRight + EDITOR_HORIZONTAL_GUTTER - viewport.clientWidth
        );
      } else if (caretRight < viewport.scrollLeft + EDITOR_HORIZONTAL_GUTTER) {
        viewport.scrollLeft = Math.max(
          0,
          caretRight - EDITOR_HORIZONTAL_GUTTER
        );
      }

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
  const edited =
    names.length !== originalNames.length ||
    names.some((name) => sources[name] !== original[name]);
  const lineCount = source.split("\n").length;
  // Size the editor for the longest file so switching tabs doesn't make the page jump
  const editorLines = Math.max(
    ...names.map((name) => (sources[name] ?? "").split("\n").length)
  );
  const editorHeight = Math.max(
    editorLines * EDITOR_LINE_HEIGHT + EDITOR_VERTICAL_PADDING,
    minEditorHeight
  );

  async function run() {
    const runner = getRunner("javascript");
    if (!runner || running) return;

    setRunning(true);
    setLines([]);
    setChallengeView(null);

    const challengeResults: { value: CaseResult[] | null } = { value: null };
    const onLine = (line: OutputLine) => {
      if (
        challenge &&
        line.level === "log" &&
        line.text.startsWith(CHALLENGE_RESULT_PREFIX)
      ) {
        try {
          const parsed: unknown = JSON.parse(
            line.text.slice(CHALLENGE_RESULT_PREFIX.length)
          );
          challengeResults.value = isCaseResults(parsed) ? parsed : null;
        } catch {
          challengeResults.value = null;
        }
        return;
      }

      setLines((prev) => {
        const current = prev ?? [];
        return current.length >= MAX_LINES ? current : [...current, line];
      });
    };

    if (isMulti) {
      const runnableFiles = challenge
        ? {
            ...sources,
            [activeEntry]: `${sources[activeEntry] ?? ""}\n${createChallengeHarness(challenge)}`,
          }
        : sources;
      await runner.runFiles(runnableFiles, activeEntry, onLine);
    } else {
      const runnableSource = challenge
        ? `${source}\n${createChallengeHarness(challenge)}`
        : source;
      await runner.run(runnableSource, onLine);
    }

    if (challenge) {
      const report = buildChallengeReport(
        challenge,
        isMulti ? sources[activeEntry] ?? "" : source,
        challengeResults.value
      );
      setLines((prev) => [...(prev ?? []), ...report.lines]);
      setChallengeView(report.view);
      onChallengeResult?.(report.passed);
    }

    setRunning(false);
  }

  function reset() {
    setSources(original);
    setNames(originalNames);
    setActiveName(originalEntry);
    setEntryName(originalEntry);
    setNewFileName("");
    setFileError("");
    setLines(null);
    setChallengeView(null);
    onChallengeResult?.(null);
  }

  function addFile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const baseName = newFileName.trim().replace(/\\/g, "/");
    const name = baseName.endsWith(".js") ? baseName : `${baseName}.js`;
    if (!baseName) {
      setFileError("Enter a name for the new file.");
      return;
    }
    if (!/^[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*\.js$/.test(name)) {
      setFileError("Use letters, numbers, underscores, or dashes, with an optional folder path and .js extension.");
      return;
    }
    if (names.length >= maxFiles) {
      setFileError(`You can have up to ${maxFiles} files.`);
      return;
    }
    if (name in sources) {
      setFileError("A file with that name already exists.");
      return;
    }

    setSources((current) => ({ ...current, [name]: "" }));
    setNames((current) => [...current, name]);
    setActiveName(name);
    setNewFileName("");
    setFileError("");
    setLines(null);
    setChallengeView(null);
  }

  function removeActiveFile() {
    if (names.length <= 1) return;
    const nextNames = names.filter((name) => name !== activeName);
    const nextActive = nextNames[0]!;
    setSources((current) => {
      const updated = { ...current };
      delete updated[activeName];
      return updated;
    });
    setNames(nextNames);
    setActiveName(nextActive);
    if (activeEntry === activeName) setEntryName(nextActive);
    setLines(null);
    setChallengeView(null);
  }

  function switchTab(name: string) {
    setActiveName(name);
    if (editorViewportRef.current) editorViewportRef.current.scrollTop = 0;
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

      {isMulti && (
        <div
          role="group"
          aria-label={`${title} files`}
          className="flex overflow-x-auto border-b bg-muted/30"
        >
          {names.map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={name === activeName}
              onClick={() => switchTab(name)}
              className={cn(
                "shrink-0 border-r px-4 py-2 font-mono text-xs transition-colors",
                name === activeName
                  ? "bg-background text-foreground"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <span>{name}</span>
              {name === activeEntry && (
                <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                  Entry
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {allowFileManagement && (
        <div className="space-y-2 border-b bg-background px-3 py-3 sm:px-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <form onSubmit={addFile} className="flex min-w-0 flex-1 items-center gap-2">
              <input
                aria-label="New JavaScript file name"
                value={newFileName}
                onChange={(event) => {
                  setNewFileName(event.target.value);
                  setFileError("");
                }}
                placeholder="helpers.js"
                maxLength={80}
                className="h-9 min-w-0 flex-1 rounded-md border bg-background px-3 font-mono text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring sm:max-w-56"
              />
              <div className="flex shrink-0 items-center gap-2">
                <Button type="submit" disabled={names.length >= maxFiles}>
                  <Plus aria-hidden="true" data-icon="inline-start" />
                  Add file
                </Button>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {names.length}/{maxFiles}
                </span>
              </div>
            </form>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={activeEntry === activeName}
                onClick={() => {
                  setEntryName(activeName);
                  setLines(null);
                  setChallengeView(null);
                }}
              >
                {activeEntry === activeName ? "Entry file" : "Use as entry"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                aria-label={`Remove ${activeName}`}
                title={`Remove ${activeName}`}
                disabled={names.length <= 1}
                onClick={removeActiveFile}
              >
                <Trash2 aria-hidden="true" className="size-4 shrink-0" />
                <span>Remove</span>
              </Button>
            </div>
          </div>
          {fileError && <p role="alert" className="m-0 text-xs text-destructive">{fileError}</p>}
        </div>
      )}

      <ScrollArea
        autoHide
        orientation="both"
        viewportRef={editorViewportRef}
        className="max-h-[min(24rem,60dvh)] w-full"
        style={{ height: Math.min(editorHeight, EDITOR_MAX_HEIGHT) }}
      >
        {/* min-height makes a shorter file fill the editor, so the gutter, the focus ring
            and the clickable area cover the whole box instead of stopping after the last line */}
        <div
          className="flex w-max min-w-full bg-background focus-within:ring-1 focus-within:ring-ring/50 focus-within:ring-inset"
          style={{ minHeight: editorHeight }}
        >
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
          <div className="grid min-w-max flex-1">
            <pre
              aria-hidden
              className={cn(
                editorText,
                "pointer-events-none col-start-1 row-start-1 px-4 py-4 pr-8 whitespace-pre"
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
              readOnly={!isEditable}
              onChange={(event) => {
                const textarea = event.currentTarget;
                setSource(textarea.value);
                requestAnimationFrame(() => revealCaret(textarea));
              }}
              onKeyDown={handleKeyDown}
              onKeyUp={(event) => revealCaret(event.currentTarget)}
              onSelect={(event) => revealCaret(event.currentTarget)}
              rows={1}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              wrap="off"
              aria-label={
                isMulti
                  ? `${title}: ${activeName} code editor`
                  : `${title} code editor`
              }
              className={cn(
                editorText,
                "col-start-1 row-start-1 h-full w-full resize-none overflow-hidden bg-transparent p-4 whitespace-pre text-transparent caret-foreground outline-none selection:bg-primary/25",
                !isEditable && "cursor-default"
              )}
            />
          </div>
        </div>
      </ScrollArea>

      <div className="border-t bg-muted/50 px-4 py-3">
        <div className="flex min-h-9 items-center justify-between gap-2">
          <p className="m-0 min-w-0 text-xs leading-5 text-muted-foreground">
            {shown === null
              ? challenge
                ? "Run tests to check your solution"
                : "Run code to see output"
              : challengeView?.kind === "summary"
                ? "Test results"
                : challengeView?.kind === "case"
                  ? `Case ${challengeView.index + 1} of ${challengeView.total}`
                  : "Output"}
            {isMulti && <span className="font-mono"> · {activeEntry}</span>}
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
              {running ? "Running…" : challenge ? "Run tests" : "Run"}
            </Button>
          </span>
        </div>

        {/* Always mounted so screen readers announce output when it appears */}
        <div aria-live="polite" className={cn(shown !== null && "mt-2")}>
          {shown !== null && (
            challengeView?.kind === "case" ? (
              <div className="max-h-64 w-full space-y-2 overflow-y-auto">
                <ResultValueCard label="Input" value={challengeView.input} />
                <ResultValueCard label="Expected" value={challengeView.expected} />
                <ResultValueCard
                  label="Your Output"
                  value={challengeView.output}
                  error={challengeView.outputIsError}
                  requirementError={challengeView.requirementError}
                  logs={challengeView.logs}
                />
              </div>
            ) : challengeView?.kind === "summary" ? (
              <p className="m-0 text-sm leading-6 text-emerald-700 dark:text-emerald-400">
                {shown.map((line) => line.text).join("\n")}
              </p>
            ) : shown.length === 0 ? (
              <p className={cn(editorText, "text-muted-foreground")}>
                {running ? "Running…" : "(no output)"}
              </p>
            ) : (
              // Plain overflow-auto: it grows with the output up to max-h-40, then scrolls
              // up/down, and scrolls left/right when a line is wider than the box
              <div className="max-h-40 w-full overflow-auto">
                <div className="w-max min-w-full">
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
              </div>
            )
          )}
        </div>
      </div>
    </figure>
  );
}
