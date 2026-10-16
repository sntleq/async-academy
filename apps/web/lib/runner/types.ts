export type Language = "javascript" | "text";

export type LogLevel = "log" | "info" | "warn" | "error";

export interface OutputLine {
  level: LogLevel;
  text: string;
}

// Strategy interface: every language gets a runner with this same shape.
// A future "dom" runner for the jQuery unit just implements it too.
export interface Runner {
  run(code: string, onLine: (line: OutputLine) => void): Promise<void>;
}
