export type TokenType =
  | "comment"
  | "string"
  | "number"
  | "keyword"
  | "literal"
  | "builtin"
  | "function"
  | "plain"
  | "punct";

export interface Token {
  type: TokenType;
  text: string;
}

const KEYWORDS = new Set([
  "const",
  "let",
  "var",
  "function",
  "return",
  "if",
  "else",
  "for",
  "while",
  "do",
  "switch",
  "case",
  "break",
  "continue",
  "new",
  "class",
  "extends",
  "import",
  "export",
  "default",
  "async",
  "await",
  "try",
  "catch",
  "finally",
  "throw",
  "typeof",
  "instanceof",
  "in",
  "of",
  "delete",
  "void",
  "yield",
  "static",
  "this",
  "super",
]);

const LITERALS = new Set([
  "true",
  "false",
  "null",
  "undefined",
  "NaN",
  "Infinity",
]);

const BUILTINS = new Set([
  "console",
  "Math",
  "JSON",
  "Object",
  "Array",
  "String",
  "Number",
  "Boolean",
  "Symbol",
  "BigInt",
  "Promise",
  "Map",
  "Set",
  "WeakMap",
  "WeakSet",
  "Date",
  "Error",
  "TypeError",
  "ReferenceError",
  "SyntaxError",
  "RegExp",
  "Intl",
  "window",
  "document",
  "globalThis",
  "require",
  "module",
  "process",
]);

const COMMENT = /\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$)/y;
const STRING = /"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?/y;
const NUMBER =
  /0[xX][\da-fA-F_]+n?|\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?n?/y;
const IDENT = /[A-Za-z_$][\w$]*/y;
const SPACE = /\s+/y;

function match(re: RegExp, code: string, i: number): string | null {
  re.lastIndex = i;
  const m = re.exec(code);
  return m ? m[0] : null;
}

// Template literals: the text parts are strings, the ${...} parts are tokenized as code.
function scanTemplate(code: string, start: number, tokens: Token[]): number {
  let buf = "`";
  let i = start + 1;

  const flush = () => {
    if (buf) tokens.push({ type: "string", text: buf });
    buf = "";
  };

  while (i < code.length) {
    const ch = code[i]!;

    if (ch === "\\") {
      buf += code.slice(i, i + 2);
      i += 2;
    } else if (ch === "`") {
      buf += "`";
      flush();
      return i + 1;
    } else if (ch === "$" && code[i + 1] === "{") {
      flush();
      tokens.push({ type: "punct", text: "${" });
      i = scan(code, i + 2, tokens, true);
      if (code[i] === "}") {
        tokens.push({ type: "punct", text: "}" });
        i++;
      }
    } else {
      buf += ch;
      i++;
    }
  }

  flush();
  return i;
}

// Scans code from index i. Inside a template expression it stops at the closing "}".
function scan(
  code: string,
  from: number,
  tokens: Token[],
  inTemplate: boolean
): number {
  let i = from;
  let depth = 0;
  let prev = ""; // last significant (non-space, non-comment) character

  while (i < code.length) {
    const ch = code[i]!;
    let text: string | null;

    if ((text = match(SPACE, code, i))) {
      tokens.push({ type: "plain", text });
      i += text.length;
      continue;
    }

    if ((text = match(COMMENT, code, i))) {
      tokens.push({ type: "comment", text });
      i += text.length;
      continue;
    }

    if ((text = match(STRING, code, i))) {
      tokens.push({ type: "string", text });
      i += text.length;
      prev = text.slice(-1);
      continue;
    }

    if (ch === "`") {
      i = scanTemplate(code, i, tokens);
      prev = "`";
      continue;
    }

    if ((text = match(NUMBER, code, i))) {
      tokens.push({ type: "number", text });
      i += text.length;
      prev = "0";
      continue;
    }

    if ((text = match(IDENT, code, i))) {
      let type: TokenType = "plain";
      const isProperty = prev === ".";
      const isCall = /^\s*\(/.test(
        code.slice(i + text.length, i + text.length + 40)
      );

      if (!isProperty && KEYWORDS.has(text)) type = "keyword";
      else if (!isProperty && LITERALS.has(text)) type = "literal";
      else if (!isProperty && BUILTINS.has(text)) type = "builtin";
      else if (isCall) type = "function";

      tokens.push({ type, text });
      i += text.length;
      prev = "a";
      continue;
    }

    if (inTemplate) {
      if (ch === "{") depth++;
      else if (ch === "}") {
        if (depth === 0) return i;
        depth--;
      }
    }

    tokens.push({ type: "punct", text: ch });
    prev = ch;
    i++;
  }

  return i;
}

export function tokenizeJs(code: string): Token[] {
  const tokens: Token[] = [];
  scan(code, 0, tokens, false);
  return tokens;
}
