"use client";

import Link from "next/link";
import { ArrowUpRight, BookOpen, Check, MoveRight } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import type { Unit } from "@/lib/lessons";

export function CourseProgress({ units }: { units: Unit[] }) {
  const {
    user,
    loading: authLoading,
    completedLessons: completed,
    progressLoading: loading,
    progressError: error,
  } = useAuth();
  const completedKeys = new Set(
    completed.map((item) => `${item.unitSlug}/${item.lessonSlug}`)
  );
  const lessonCount = units.reduce((count, unit) => count + unit.items.length, 0);
  const completedCount = units.reduce(
    (count, unit) =>
      count + unit.items.filter((lesson) => completedKeys.has(`${unit.slug}/${lesson.slug}`)).length,
    0
  );
  const percentage = lessonCount ? Math.round((completedCount / lessonCount) * 100) : 0;
  return (
    <>
      <section className="mb-12 rounded-xl border bg-card p-5 sm:p-7" aria-labelledby="progress-title">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              {user ? "Your progress" : "Make it yours"}
            </p>
            <h2 id="progress-title" className="font-heading text-3xl tracking-tight">
              {authLoading
                ? "Checking your account…"
                : user
                  ? loading
                    ? "Loading your progress…"
                    : completedCount === lessonCount && lessonCount > 0
                      ? "Course complete. Nice work."
                      : `You’ve completed ${completedCount} of ${lessonCount} lessons.`
                  : "Keep your place as you learn."}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {user
                ? "Finished quizzes are saved automatically to your account."
                : "Sign in to save completed quizzes and see your progress across the course."}
            </p>
          </div>
          {!user && !authLoading ? (
            <Link
              href="/login"
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Sign in or create account <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          ) : null}
        </div>
        {user && !loading && !error && (
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Course progress</span>
              <span>{percentage}%</span>
            </div>
            <div
              role="progressbar"
              aria-label="Course progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percentage}
              className="h-2 overflow-hidden rounded-full bg-muted"
            >
              <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${percentage}%` }} />
            </div>
          </div>
        )}
        {error && (
          <p role="status" className="mt-4 text-sm text-destructive">
            Could not load your saved progress. Check that Firestore is set up and its rules are published.
          </p>
        )}
      </section>

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
          {lessonCount} lessons
        </span>
      </div>

      <div className="grid border-t sm:grid-cols-2 xl:grid-cols-3">
        {units.map((unit, index) => {
          const unitCompleted = unit.items.filter((lesson) =>
            completedKeys.has(`${unit.slug}/${lesson.slug}`)
          ).length;
          const unitNext = unit.items.find((lesson) =>
            !completedKeys.has(`${unit.slug}/${lesson.slug}`)
          );
          const destination = unitNext ?? unit.items[0]!;

          return (
            <section
              key={unit.slug}
              className="group border-b py-6 sm:border-r sm:px-5 sm:py-7 sm:last:col-span-2 sm:last:border-r-0 xl:border-r xl:px-6 xl:last:col-span-3 xl:last:border-r-0 sm:[&:nth-child(2n)]:border-r-0 xl:[&:nth-child(2n)]:border-r xl:[&:nth-child(3n)]:border-r-0"
            >
              <Link href={destination.href} className="flex h-full flex-col">
                <div className="mb-8 flex items-center justify-between">
                  <span className="font-mono text-xs text-primary">0{index + 1}</span>
                  {user && unitCompleted === unit.items.length ? (
                    <Check aria-hidden="true" className="size-4 text-primary" />
                  ) : (
                    <ArrowUpRight aria-hidden="true" className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
                  )}
                </div>
                <h3 className="mb-2 font-heading text-3xl leading-tight tracking-tight">{unit.title}</h3>
                <p className="mb-5 text-sm text-muted-foreground">
                  {user ? `${unitCompleted} of ${unit.items.length} lessons complete` : `${unit.items.length} short lessons`}
                </p>
                {user && (
                  <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-[width]"
                      style={{ width: `${Math.round((unitCompleted / unit.items.length) * 100)}%` }}
                    />
                  </div>
                )}
                <div className="mt-auto flex items-center gap-2 border-t pt-4 text-sm">
                  {user && completedKeys.has(`${unit.slug}/${destination.slug}`) ? (
                    <Check aria-hidden="true" className="size-4 text-primary" />
                  ) : (
                    <BookOpen aria-hidden="true" className="size-4 text-muted-foreground" />
                  )}
                  <span>{user && unitNext ? `Next: ${unitNext.title}` : destination.title}</span>
                  <MoveRight aria-hidden="true" className="ml-auto size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </div>
              </Link>
            </section>
          );
        })}
      </div>
    </>
  );
}

export function ContinueLearningCard({ units }: { units: Unit[] }) {
  const {
    user,
    loading: authLoading,
    completedLessons,
    progressLoading,
  } = useAuth();
  const lessons = units.flatMap((unit) => unit.items);
  const completedKeys = new Set(
    completedLessons.map((lesson) => `${lesson.unitSlug}/${lesson.lessonSlug}`)
  );
  const completedCount = lessons.filter((lesson) =>
    completedKeys.has(`${lesson.unitSlug}/${lesson.slug}`)
  ).length;
  const nextLesson = lessons.find(
    (lesson) => !completedKeys.has(`${lesson.unitSlug}/${lesson.slug}`)
  );
  const target = nextLesson ?? lessons[lessons.length - 1]!;
  const unit = units.find((item) => item.slug === target.unitSlug)!;
  const label = authLoading || (user && progressLoading)
    ? "Loading your progress"
    : !user || completedCount === 0
      ? "Start here"
      : nextLesson
        ? "Continue learning"
        : "Review the course";

  return (
    <Link
      href={target.href}
      className="group flex min-h-48 flex-col justify-between rounded-lg bg-primary p-5 text-primary-foreground transition-colors hover:bg-primary/90 sm:p-6"
    >
      <div className="flex items-center justify-between text-xs tracking-[0.14em] text-primary-foreground/70 uppercase">
        <span>{label}</span>
        <ArrowUpRight
          aria-hidden="true"
          className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </div>
      <div>
        <p className="mb-2 text-sm text-primary-foreground/75">{unit.title}</p>
        <p className="font-heading text-3xl leading-none">{target.title}</p>
      </div>
    </Link>
  );
}
