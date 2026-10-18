import { tokenizeJs, type Token } from "@/lib/highlight/tokenize-js";
import type { Files } from "./types";

export interface Bundle {
  // blob: URL of the entry file. Import it inside a module worker.
  entryUrl: string;
  // blob: URL -> file name, so error messages can say "counter.js"
  names: Record<string, string>;
  // Frees every blob: URL. Call it when the run is over.
  dispose(): void;
}

function directory(path: string): string {
  const slash = path.lastIndexOf("/");
  return slash === -1 ? "" : path.slice(0, slash);
}

// "app/main.js" + "../lib/math.js" -> "lib/math.js"
function resolvePath(from: string, specifier: string): string {
  const dir = directory(from);
  const parts = dir ? dir.split("/") : [];

  for (const segment of specifier.split("/")) {
    if (segment === "" || segment === ".") continue;
    if (segment === "..") parts.pop();
    else parts.push(segment);
  }
  return parts.join("/");
}

// Indexes of the string tokens that are module specifiers:
//   import x from "./a.js"     export * from "./a.js"
//   import "./a.js"            import("./a.js")
// Working on tokens (not raw text) means the word "from" inside a comment or
// another string is never mistaken for an import.
function findSpecifiers(tokens: Token[]): number[] {
  const found: number[] = [];
  let prev: Token | undefined; // last token that is not whitespace or a comment
  let beforePrev: Token | undefined;

  tokens.forEach((token, index) => {
    if (
      token.type === "comment" ||
      (token.type === "plain" && token.text.trim() === "")
    ) {
      return;
    }

    if (token.type === "string" && /^["']/.test(token.text)) {
      const afterFrom = prev?.type === "plain" && prev.text === "from";
      const afterImport = prev?.type === "keyword" && prev.text === "import";
      const dynamicImport =
        prev?.text === "(" &&
        beforePrev?.type === "keyword" &&
        beforePrev.text === "import";

      if (afterFrom || afterImport || dynamicImport) found.push(index);
    }

    beforePrev = prev;
    prev = token;
  });

  return found;
}

// Turns the files into real ES modules that import each other by blob: URL.
// Dependencies are created first, because a blob: URL only exists once its
// content is final. That is also why circular imports cannot work here.
export function bundleModules(files: Files, entry: string): Bundle {
  if (files[entry] === undefined) {
    throw new Error('Entry file "' + entry + '" does not exist');
  }

  const urls = new Map<string, string>();
  const visiting: string[] = [];

  function findFile(path: string): string | undefined {
    if (files[path] !== undefined) return path;
    if (files[path + ".js"] !== undefined) return path + ".js";
    return undefined;
  }

  function build(path: string): string {
    const existing = urls.get(path);
    if (existing) return existing;

    if (visiting.includes(path)) {
      const loop = [...visiting.slice(visiting.indexOf(path)), path];
      throw new Error("Circular import: " + loop.join(" -> "));
    }
    visiting.push(path);

    const tokens = tokenizeJs(files[path] ?? "");

    for (const index of findSpecifiers(tokens)) {
      const specifier = tokens[index]!.text.slice(1, -1);

      if (!/^\.{1,2}\//.test(specifier)) {
        throw new Error(
          'Cannot import "' + specifier + '" from "' + path +
          '". Use a relative path like "./name.js".'
        );
      }

      const target = findFile(resolvePath(path, specifier));
      if (target === undefined) {
        throw new Error(
          'Cannot find "' + specifier + '" imported from "' + path + '"'
        );
      }

      tokens[index] = { type: "string", text: JSON.stringify(build(target)) };
    }

    visiting.pop();

    const url = URL.createObjectURL(
      new Blob([tokens.map((token) => token.text).join("")], {
        type: "text/javascript",
      })
    );
    urls.set(path, url);
    return url;
  }

  const dispose = () => urls.forEach((url) => URL.revokeObjectURL(url));

  try {
    const entryUrl = build(entry);
    const names: Record<string, string> = {};
    urls.forEach((url, path) => {
      names[url] = path;
    });
    return { entryUrl, names, dispose };
  } catch (error) {
    dispose();
    throw error;
  }
}