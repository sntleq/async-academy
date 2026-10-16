import Link from "next/link";
import { ArrowUpRight, BookOpen, MoveRight } from "lucide-react";
import { Curriculum } from "@/lib/lessons";

export const metadata = {
  title: "Learn JavaScript",
};

export default function Page() {
  const units = Curriculum.getInstance().getUnits();
  const lessons = units.flatMap((unit) => unit.items);
  const featured = lessons[0]!;
  const startingUnit = units[0]!;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-10 pb-16 sm:px-6 sm:pt-16 lg:px-8 lg:pt-20">
      <div className="mb-12 flex items-center gap-2 text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
        <span className="size-1.5 rounded-full bg-primary" />
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
        <Link
          href={featured.href}
          className="group flex min-h-48 flex-col justify-between rounded-lg bg-primary p-5 text-primary-foreground transition-colors hover:bg-primary/90 sm:p-6"
        >
          <div className="flex items-center justify-between text-xs tracking-[0.14em] text-primary-foreground/70 uppercase">
            <span>Start here</span>
            <ArrowUpRight
              aria-hidden="true"
              className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </div>
          <div>
            <p className="mb-2 text-sm text-primary-foreground/75">
              {startingUnit.title}
            </p>
            <p className="font-heading text-3xl leading-none">
              {featured.title}
            </p>
          </div>
        </Link>
      </section>

      <section className="pt-10 sm:pt-14">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-medium tracking-[0.14em] text-primary uppercase">
              The library
            </p>
            <h2 className="font-heading text-4xl tracking-tight sm:text-5xl">
              Explore the curriculum
            </h2>
          </div>
          <span className="hidden pb-1 text-sm text-muted-foreground sm:block">
            {lessons.length} lessons
          </span>
        </div>

        <div className="grid border-t sm:grid-cols-2 xl:grid-cols-3">
          {units.map((unit, index) => (
            <section
              key={unit.slug}
              className="group border-b py-6 sm:border-r sm:px-5 sm:py-7 sm:last:col-span-2 sm:last:border-r-0 xl:border-r xl:px-6 xl:last:col-span-3 xl:last:border-r-0 sm:[&:nth-child(2n)]:border-r-0 xl:[&:nth-child(2n)]:border-r xl:[&:nth-child(3n)]:border-r-0"
            >
              <Link href={unit.items[0]!.href} className="flex h-full flex-col">
                <div className="mb-8 flex items-center justify-between">
                  <span className="font-mono text-xs text-primary">
                    0{index + 1}
                  </span>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
                  />
                </div>
                <h3 className="mb-2 font-heading text-3xl leading-tight tracking-tight">
                  {unit.title}
                </h3>
                <p className="mb-5 text-sm text-muted-foreground">
                  {unit.items.length} short lessons
                </p>
                <div className="mt-auto flex items-center gap-2 border-t pt-4 text-sm">
                  <BookOpen
                    aria-hidden="true"
                    className="size-4 text-muted-foreground"
                  />
                  <span>{unit.items[0]!.title}</span>
                  <MoveRight
                    aria-hidden="true"
                    className="ml-auto size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary"
                  />
                </div>
              </Link>
            </section>
          ))}
        </div>
      </section>

      <footer className="flex items-center justify-between pt-5 text-xs text-muted-foreground">
        <span>Async Academy 2026</span>
        <span>{units.length} learning paths</span>
      </footer>
    </div>
  );
}
