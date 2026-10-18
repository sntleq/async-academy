import { bundleModules, type Bundle } from "./bundle-modules";
import { WORKER_SOURCE } from "./worker-source";
import type { Files, OutputLine, Runner } from "./types";

// What the worker's onmessage accepts: a string runs as a script,
// an object starts the module graph at `entry` (a blob: URL).
type WorkerMessage = string | { entry: string; names: Record<string, string> };

// Factory: builds a runner with its own timeout.
// Each run gets a fresh worker, so runs never share variables and an infinite
// loop can be killed with worker.terminate().
export function createWorkerRunner(timeoutMs: number): Runner {
  // Shared by run and runFiles: start a worker, send it one message, and resolve
  // when it is done, fails, or times out. `cleanup` runs exactly once at the end.
  function execute(
    message: WorkerMessage,
    options: WorkerOptions,
    onLine: (line: OutputLine) => void,
    cleanup?: () => void
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      const url = URL.createObjectURL(
        new Blob([WORKER_SOURCE], { type: "text/javascript" })
      );
      const worker = new Worker(url, options);
      let finished = false;

      const finish = () => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        worker.terminate();
        URL.revokeObjectURL(url);
        cleanup?.();
        resolve();
      };

      const timer = setTimeout(() => {
        onLine({
          level: "error",
          text: `Execution stopped after ${timeoutMs / 1000} seconds.`,
        });
        finish();
      }, timeoutMs);

      worker.onmessage = (event: MessageEvent) => {
        if (event.data.type === "line") onLine(event.data.line);
        if (event.data.type === "done") finish();
      };

      worker.onerror = (event) => {
        onLine({ level: "error", text: event.message });
        finish();
      };

      worker.postMessage(message);
    });
  }

  return {
    // One script: a classic worker evaluates it as plain code.
    run(code, onLine) {
      return execute(code, {}, onLine);
    },

    // Several files: rewrite the imports to blob: URLs, then let a module worker
    // load the graph with import(). The blob: URLs are freed when the run ends.
    runFiles(files: Files, entry, onLine) {
      let bundle: Bundle;
      try {
        bundle = bundleModules(files, entry);
      } catch (error) {
        // Missing file, bare specifier, circular import: report it like any other error
        onLine({
          level: "error",
          text:
            error instanceof Error
              ? `${error.name}: ${error.message}`
              : String(error),
        });
        return Promise.resolve();
      }

      return execute(
        { entry: bundle.entryUrl, names: bundle.names },
        { type: "module" },
        onLine,
        bundle.dispose
      );
    },
  };
}