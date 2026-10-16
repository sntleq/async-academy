import { TableOfContents } from "@/components/layout/table-of-contents";
import { LessonPager } from "@/components/lesson/lesson-pager";

export function ContentWithToc({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-[90rem] gap-8 px-4 sm:px-6 lg:px-8">
      <article
        id="lesson-content"
        className="mx-auto w-full max-w-4xl min-w-0 flex-1 py-10 sm:py-14 lg:py-16"
      >
        {children}
        <LessonPager />
      </article>
      <div className="hidden 2xl:block">
        <TableOfContents containerId="lesson-content" />
      </div>
    </div>
  );
}
