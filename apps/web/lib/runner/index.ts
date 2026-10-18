import { createWorkerRunner } from "./js-runner";
import type { Language, Runner } from "./types";

export type { Files, Language, LogLevel, OutputLine, Runner } from "./types";

// Strategy pattern: pick the runner by language instead of if/else chains.
// For the jQuery unit, add `html: createIframeRunner(...)` here and nothing else changes.
const runners: Partial<Record<Language, Runner>> = {
  javascript: createWorkerRunner(5000),
};

export function getRunner(language: Language): Runner | null {
  return runners[language] ?? null;
}

// Safe to call on the server: it only checks the language, it never touches Worker.
export function isRunnable(language: Language): boolean {
  return language === "javascript";
}