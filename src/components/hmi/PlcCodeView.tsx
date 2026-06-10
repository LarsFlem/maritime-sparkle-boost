import { useState } from "react";

/**
 * Generic TwinCAT-online-style structured text renderer: syntax-coloured
 * code lines with live watch chips and active-branch highlighting.
 * Each demo builds its own line arrays and feeds them in as tabs.
 */

export type TokClass = "kw" | "fn" | "cm" | "num" | "id" | "op" | "type";

const TOK_CLS: Record<TokClass, string> = {
  kw: "text-[hsl(210,90%,68%)]",
  fn: "text-[hsl(180,70%,60%)]",
  cm: "text-[hsl(150,25%,50%)] italic",
  num: "text-[hsl(38,80%,65%)]",
  id: "text-foreground/85",
  op: "text-muted-foreground",
  type: "text-[hsl(280,45%,70%)]",
};

export interface Tok {
  t: string;
  c?: TokClass;
}

export interface CodeLine {
  toks: Tok[];
  /** Live watch chips rendered right-aligned, TwinCAT online-view style */
  watch?: { label: string; value: string | boolean }[];
  /** Highlight as currently-executing branch */
  active?: boolean;
}

const Chip = ({ label, value }: { label: string; value: string | boolean }) => {
  const isBool = typeof value === "boolean";
  return (
    <span className="inline-flex items-center gap-1 shrink-0">
      <span className="text-[8px] text-muted-foreground/60">{label}</span>
      <span
        className={`px-1 py-px rounded-sm text-[9px] font-semibold tabular-nums ${
          isBool
            ? value
              ? "bg-[hsl(150,70%,45%)]/15 text-[hsl(150,70%,55%)]"
              : "bg-muted/40 text-muted-foreground/70"
            : "bg-primary/10 text-primary"
        }`}
      >
        {isBool ? (value ? "TRUE" : "FALSE") : value}
      </span>
    </span>
  );
};

const Line = ({ line }: { line: CodeLine }) => (
  <div
    className={`flex items-start justify-between gap-3 px-3 -mx-1 rounded-sm leading-[1.45] ${
      line.active ? "bg-primary/[0.07] border-l-2 border-primary/60" : "border-l-2 border-transparent"
    }`}
  >
    <pre className="whitespace-pre font-mono text-[10.5px]">
      {line.toks.map((tok, i) => (
        <span key={i} className={TOK_CLS[tok.c ?? "id"]}>{tok.t}</span>
      ))}
    </pre>
    {line.watch && (
      <span className="flex items-center gap-2 pt-px">
        {line.watch.map((w, i) => <Chip key={i} label={w.label} value={w.value} />)}
      </span>
    )}
  </div>
);

export interface PlcTab {
  id: string;
  lines: CodeLine[];
}

interface PlcCodeViewProps {
  tabs: PlcTab[];
  hint: string;
}

const PlcCodeView = ({ tabs, hint }: PlcCodeViewProps) => {
  const [tab, setTab] = useState(tabs[0]?.id);
  const lines = tabs.find((tb) => tb.id === tab)?.lines ?? [];

  return (
    <div>
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-3 p-1 rounded-md bg-background/40 border border-border/40 w-fit max-w-full flex-wrap">
        {tabs.map((tb) => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            className={`px-2.5 py-1 rounded font-mono text-[10px] uppercase tracking-wider transition-colors ${
              tab === tb.id ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tb.id}
          </button>
        ))}
        <span className="ml-2 mr-1 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[hsl(150,70%,55%)] animate-pulse" />
          <span className="font-mono text-[9px] uppercase tracking-wider text-[hsl(150,70%,55%)]">Online</span>
        </span>
      </div>

      {/* Code */}
      <div className="rounded-md border border-border/40 bg-background/70 py-2 px-1 overflow-x-auto">
        <div className="min-w-[460px] space-y-px">
          {lines.map((line, i) => <Line key={i} line={line} />)}
        </div>
      </div>

      <p className="mt-2.5 text-[11px] leading-relaxed text-muted-foreground">{hint}</p>
    </div>
  );
};

export default PlcCodeView;
