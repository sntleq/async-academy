import Link from "next/link";
import { Curriculum } from "@/lib/lessons";
import {
  ContinueLearningCard,
  CourseProgress,
} from "@/components/progress/course-progress";

export const metadata = {
  title: "Learn JavaScript",
};

export default function Page() {
  const units = Curriculum.getInstance().getUnits();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-10 pb-16 sm:px-6 sm:pt-16 lg:px-8 lg:pt-20">
      <div className="mb-3 flex items-center gap-2 text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
        JavaScript course
      </div>

      <section className="grid gap-10 border-b pb-12 md:grid-cols-[minmax(0,1fr)_15rem] md:items-center md:gap-16 md:pb-16">
        <div>
          <h1 className="max-w-3xl font-heading text-6xl leading-[0.94] tracking-[-0.04em] sm:text-7xl lg:text-8xl">
            Learn <span className="text-primary">JavaScript</span> at your own
            pace.
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-pretty text-muted-foreground sm:text-lg">
            Short lessons with code you can run, and small coding challenges to
            lock each one in. Start at the top, or jump to what you need.
          </p>
        </div>
        <ContinueLearningCard units={units} />
      </section>

      <section className="pt-8 sm:pt-10">
        <CourseProgress units={units} />
      </section>

      <footer className="flex items-center justify-between pt-5 text-xs text-muted-foreground">
        <span>Async Academy 2026</span>
        <span>{units.length} learning paths</span>
      </footer>
    </div>
  );
}
