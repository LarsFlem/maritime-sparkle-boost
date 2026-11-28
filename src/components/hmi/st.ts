import type { CodeLine, Tok, TokClass } from "@/components/hmi/PlcCodeView";

const KEYWORDS = new Set([
  "IF", "THEN", "ELSIF", "ELSE", "END_IF", "CASE", "OF", "END_CASE", "FOR", "TO", "BY", "DO",
  "END_FOR", "WHILE", "END_WHILE", "AND", "OR", "XOR", "NOT", "TRUE", "FALSE", "RETURN", "MOD",
]);
const FUNCTIONS = new Set(["MIN", "MAX", "ABS", "SQRT", "EXP", "SIN", "COS", "LIMIT", "SEL", "TON", "R_TRIG"]);

// comment | time literal | number | word | operator | whitespace
const TOKEN = /(\(\*.*?\*\))|(T#[0-9A-Za-z_.]+)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)|(:=|<=|>=|<>|[-+*/<>=();,.:[\]])|(\s+)/g;

/**
 * One line of IEC 61131-3 structured text, syntax-coloured for PlcCodeView.
 * Words in UPPER_CASE are constants/enum values, words followed by "(" are
 * function or FB calls, everything else is a variable.
 */
export const st = (src: string, extra: Omit<CodeLine, "toks"> = {}): CodeLine => {
  const toks: Tok[] = [];
  let m: RegExpExecArray | null;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(src))) {
    const [text, comment, time, num, word, op] = m;
    let c: TokClass | undefined;
    if (comment) c = "cm";
    else if (time || num) c = "num";
    else if (word) {
      const next = src.slice(TOKEN.lastIndex).trimStart()[0];
      if (KEYWORDS.has(word)) c = "kw";
      else if (FUNCTIONS.has(word) || next === "(") c = "fn";
      else if (/^[A-Z][A-Z0-9_]+$/.test(word)) c = "type";
      else c = "id";
    } else if (op) c = "op";
    toks.push({ t: text, c });
  }
  return { toks, ...extra };
};
