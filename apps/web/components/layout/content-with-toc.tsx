import { TableOfContents } from "@/components/layout/table-of-contents";

export function ContentWithToc({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-8 px-8">
      <article id="lesson-content" className="min-w-0 flex-1 py-16 px-24">
        {children}
      </article>
      <TableOfContents containerId="lesson-content" />
    </div>
  );
}