export type Language = "javascript" | "text";

export type LogLevel = "log" | "info" | "warn" | "error";

export interface OutputLine {
  level: LogLevel;
  text: string;
}

// File name -> source code. Names can include folders, like "lib/math.js".
export type Files = Record<string, string>;

// Strategy interface: every language gets a runner with this same shape.
// A future "dom" runner for the jQuery unit just implements it too.
export interface Runner {
  // One script
  run(code: string, onLine: (line: OutputLine) => void): Promise<void>;

  // Several files. `entry` is the file that runs; it pulls in the others
  // with import statements.
  runFiles(
    files: Files,
    entry: string,
    onLine: (line: OutputLine) => void
  ): Promise<void>;
}