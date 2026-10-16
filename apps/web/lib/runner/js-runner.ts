import { WORKER_SOURCE } from "./worker-source";
import type { OutputLine, Runner } from "./types";

// Factory: builds a runner with its own timeout.
// Each run gets a fresh worker, so runs never share variables and an infinite
// loop can be killed with worker.terminate().
export function createWorkerRunner(timeoutMs: number): Runner {
  return {
    run(code, onLine) {
      return new Promise<void>((resolve) => {
        const url = URL.createObjectURL(
          new Blob([WORKER_SOURCE], { type: "text/javascript" })
        );
        const worker = new Worker(url);

        const finish = () => {
          clearTimeout(timer);
          worker.terminate();
          URL.revokeObjectURL(url);
          resolve();
        };

        const timer = setTimeout(() => {
          const line: OutputLine = {
            level: "error",
            text: `Execution stopped after ${timeoutMs / 1000} seconds.`,
          };
          onLine(line);
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

        worker.postMessage(code);
      });
    },
  };
}
