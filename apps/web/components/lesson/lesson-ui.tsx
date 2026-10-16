import type { ReactNode } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { CodePlayground } from "@/components/lesson/code-playground";
import { isRunnable, type Language } from "@/lib/runner";

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export function LessonTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="mb-7 font-heading text-5xl leading-[0.98] tracking-[-0.035em] sm:mb-8 sm:text-6xl">
      {children}
    </h1>
  );
}

export function P({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={cn("mb-4 leading-7", className)}>{children}</p>;
}

interface SectionProps {
  title: string;
  id?: string;
  children: ReactNode;
}

// The table of contents reads h2/h3 elements that have an id, so the id defaults to a slug of the title
export function Section({
  title,
  id = slugify(title),
  children,
}: SectionProps) {
  return (
    <section className="mt-12">
      <h2
        id={id}
        className="mb-4 scroll-mt-24 font-heading text-3xl leading-tight tracking-tight sm:text-4xl"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

export function SubSection({
  title,
  id = slugify(title),
  children,
}: SectionProps) {
  return (
    <div className="mt-8">
      <h3
        id={id}
        className="mb-3 scroll-mt-24 font-heading text-2xl leading-tight"
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

export function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em] text-primary">
      {children}
    </code>
  );
}

interface CodeBlockProps {
  code: string;
  title?: string;
  output?: string;
  language?: Language;
}

export function CodeBlock({
  code,
  title = "Example",
  output,
  language = "javascript",
}: CodeBlockProps) {
  // Runnable languages get the interactive playground; everything else stays static
  if (isRunnable(language)) {
    return <CodePlayground code={code} title={title} output={output} />;
  }

  return (
    <figure className="my-6 overflow-hidden rounded-lg border">
      <figcaption className="border-b bg-muted px-4 py-2 text-sm font-medium">
        {title}
      </figcaption>
      <pre className="overflow-x-auto p-4 font-mono text-sm leading-6">
        <code>{code.trim()}</code>
      </pre>
      {output !== undefined && (
        <div className="border-t bg-muted/50 px-4 py-3">
          <p className="mb-1 text-xs text-muted-foreground">Output</p>
          <pre className="overflow-x-auto font-mono text-sm leading-6">
            <code>{output.trim()}</code>
          </pre>
        </div>
      )}
    </figure>
  );
}

export function List({ items }: { items: ReactNode[] }) {
  return (
    <ul className="mb-4 list-disc space-y-1 pl-6 leading-7">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

interface ComparisonTableProps {
  headers: string[];
  rows: ReactNode[][];
}

export function ComparisonTable({ headers, rows }: ComparisonTableProps) {
  return (
    <div className="my-6 overflow-x-auto rounded-lg border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-2 font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-2 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type CalloutKind = "note" | "tip" | "warning";

const calloutStyles: Record<
  CalloutKind,
  {
    label: string;
    className: string;
    labelClassName?: string;
  }
> = {
  note: { label: "Note", className: "border-border" },
  tip: {
    label: "Tip",
    className: "border-primary",
    labelClassName: "text-primary",
  },
  warning: {
    label: "Watch out",
    className: "border-destructive",
    labelClassName: "text-destructive",
  },
};

// Factory: returns a ready-made callout component for each kind
function createCallout(kind: CalloutKind) {
  const { label, className, labelClassName } = calloutStyles[kind];

  return function Callout({ children }: { children: ReactNode }) {
    return (
      <aside
        className={cn(
          "my-6 rounded-r-lg border-l-4 bg-muted/50 px-4 py-3 text-sm leading-6",
          className
        )}
      >
        <p className={cn("mb-1 font-medium", labelClassName)}>{label}</p>
        {children}
      </aside>
    );
  };
}

export const Note = createCallout("note");
export const Tip = createCallout("tip");
export const Warning = createCallout("warning");
