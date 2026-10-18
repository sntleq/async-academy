// Source of the Web Worker that runs learner code. It is a string so it can be
// turned into a Blob URL at runtime (no extra bundler config needed).
//
// Module pattern: everything lives inside an IIFE. Only `run` and `runModule`
// are exposed; `pending`, `inspect`, `emit` and friends stay private.
//
// Two ways in, same worker source:
//   run(code)            one script, evaluated as plain code (classic worker)
//   runModule(url, ...)  a graph of ES modules, started with import() (module worker)
export const WORKER_SOURCE = `
var Sandbox = (function () {
  var pending = 0;
  var nativeSetTimeout = self.setTimeout.bind(self);
  var fileNames = {};

  function inspect(value, depth, seen) {
    if (typeof value === "string") return depth === 0 ? value : "'" + value + "'";
    if (typeof value === "bigint") return value + "n";
    if (typeof value === "symbol") return value.toString();
    if (typeof value === "function") return "[Function: " + (value.name || "anonymous") + "]";
    if (value === null || typeof value !== "object") return String(value);
    if (seen.has(value)) return "[Circular]";
    if (depth > 3) return Array.isArray(value) ? "[Array]" : "[Object]";

    seen.add(value);
    var result;

    if (value instanceof Error) {
      result = value.name + ": " + value.message;
    } else if (value instanceof Date) {
      result = value.toISOString();
    } else if (Array.isArray(value)) {
      result = value.length
        ? "[ " + value.map(function (v) { return inspect(v, depth + 1, seen); }).join(", ") + " ]"
        : "[]";
    } else if (value instanceof Map) {
      var entries = [];
      value.forEach(function (v, k) {
        entries.push(inspect(k, depth + 1, seen) + " => " + inspect(v, depth + 1, seen));
      });
      result = "Map(" + value.size + ") { " + entries.join(", ") + " }";
    } else if (value instanceof Set) {
      var items = [];
      value.forEach(function (v) { items.push(inspect(v, depth + 1, seen)); });
      result = "Set(" + value.size + ") { " + items.join(", ") + " }";
    } else {
      var keys = Object.keys(value);
      result = keys.length
        ? "{ " + keys.map(function (k) { return k + ": " + inspect(value[k], depth + 1, seen); }).join(", ") + " }"
        : "{}";
    }

    seen.delete(value);
    return result;
  }

  function emit(level, text) {
    self.postMessage({ type: "line", line: { level: level, text: text } });
  }

  function logger(level) {
    return function () {
      var text = Array.prototype.map
        .call(arguments, function (arg) { return inspect(arg, 0, new WeakSet()); })
        .join(" ");
      emit(level, text);
    };
  }

  function report(error) {
    var text = error instanceof Error
      ? error.name + ": " + error.message
      : "Uncaught " + inspect(error, 0, new WeakSet());

    // Module errors mention blob: URLs. Show the file names instead.
    Object.keys(fileNames).forEach(function (url) {
      text = text.split(url).join(fileNames[url]);
    });

    emit("error", text);
  }

  // Done = no timers left. Checked on a fresh macrotask so promise callbacks have already run.
  function checkDone() {
    nativeSetTimeout(function () {
      if (pending === 0) self.postMessage({ type: "done" });
    }, 0);
  }

  self.console = {
    log: logger("log"),
    info: logger("info"),
    debug: logger("log"),
    warn: logger("warn"),
    error: logger("error")
  };

  self.setTimeout = function (fn, ms) {
    var args = Array.prototype.slice.call(arguments, 2);
    pending++;
    return nativeSetTimeout(function () {
      pending--;
      try { fn.apply(null, args); } catch (error) { report(error); }
      checkDone();
    }, ms);
  };

  self.onerror = function (message) {
    emit("error", String(message));
    checkDone();
    return true;
  };

  self.addEventListener("unhandledrejection", function (event) {
    report(event.reason);
  });

  return {
    run: function (code) {
      try {
        (0, eval)(code);
      } catch (error) {
        report(error);
      }
      checkDone();
    },

    // entryUrl is a blob: URL whose imports were already rewritten to other
    // blob: URLs, so the browser loads the whole graph by itself.
    runModule: function (entryUrl, names) {
      fileNames = names || {};
      import(entryUrl).then(
        function () { checkDone(); },
        function (error) { report(error); checkDone(); }
      );
    }
  };
})();

self.onmessage = function (event) {
  var data = event.data;
  if (typeof data === "string") Sandbox.run(data);
  else Sandbox.runModule(data.entry, data.names);
};
`;