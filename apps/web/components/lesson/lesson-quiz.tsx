"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { buttonVariants } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import {
  LessonBackLink,
  LessonNextLink,
  LessonPagerButton,
} from "@/components/lesson/lesson-pager";
import { P } from "@/components/lesson/lesson-ui";
import { Curriculum, type Lesson } from "@/lib/lessons";
import { useAuth } from "@/components/auth/auth-provider";
import { saveLessonCompletion } from "@/lib/firebase/progress";

export interface LessonQuizQuestion {
  typeLabel: string;
  title: string;
  prompt: ReactNode;
  // Shown before the learner has an answer, and after a pass or a fail.
  // The pass/fail defaults are neutral, because "all checks passed" only makes
  // sense for code challenges, not for a single multiple-choice answer.
  pendingMessage?: string;
  passedMessage?: string;
  failedMessage?: string;
  renderAnswer: (onResult: (passed: boolean | null) => void) => ReactNode;
}

export function LessonQuiz({
                             lesson,
                             questions,
                             completionMessage,
                           }: {
  lesson: Lesson;
  questions: LessonQuizQuestion[];
  completionMessage: ReactNode;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [passed, setPassed] = useState<boolean | null>(null);
  const [complete, setComplete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const { user, markLessonCompleted, unmarkLessonCompleted } = useAuth();
  const quizRef = useRef<HTMLElement>(null);
  const question = questions[stepIndex];
  const nextLesson = Curriculum.getInstance().getAdjacent(lesson.href).next;
  const progress = complete ? 100 : ((stepIndex + 1) / questions.length) * 100;

  useEffect(() => {
    if (stepIndex > 0 || complete) {
      quizRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [stepIndex, complete]);

  async function continueQuiz() {
    if (passed !== true) return;

    if (stepIndex === questions.length - 1) {
      if (user) {
        setSaving(true);
        setSaveError(false);
        markLessonCompleted(lesson);
        try {
          await saveLessonCompletion(user.uid, lesson);
        } catch {
          setSaveError(true);
          unmarkLessonCompleted(lesson);
        } finally {
          setSaving(false);
        }
      }
      setComplete(true);
      return;
    }

    setStepIndex((current) => current + 1);
    setPassed(null);
  }

  return (
    <section
      ref={quizRef}
      className="mx-auto w-full max-w-5xl scroll-mt-24 px-4 py-8 sm:px-6 sm:py-12"
    >
      {!complete && (
        <nav
          aria-label="Quiz navigation"
          className="mb-8 flex items-start justify-between gap-4"
        >
          <LessonBackLink lesson={lesson} />
          {nextLesson && <LessonNextLink lesson={nextLesson} label="Skip quiz" />}
        </nav>
      )}

      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
          <span className="font-medium">
            {complete ? "Quiz complete" : `Item ${stepIndex + 1} of ${questions.length}`}
          </span>
          <span className="text-muted-foreground">
            {complete ? `${questions.length} of ${questions.length} complete` : question?.typeLabel}
          </span>
        </div>
        <div
          role="progressbar"
          aria-label="Quiz progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          className="h-2 overflow-hidden rounded-full bg-muted"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {complete ? (
        <div className="rounded-2xl border bg-card px-6 py-12 text-center shadow-sm sm:px-10">
          <CheckCircle2
            aria-hidden="true"
            className="mx-auto mb-5 size-12 text-primary"
            strokeWidth={1.6}
          />
          <h1 className="mb-3 font-heading text-4xl leading-tight tracking-tight sm:text-5xl">
            Quiz complete
          </h1>
          <p className="mx-auto mb-7 max-w-md text-balance leading-7 text-muted-foreground">
            {completionMessage}
          </p>
          {user && !saveError && (
            <p className="mb-6 text-sm text-primary">Progress saved to your account.</p>
          )}
          {saveError && (
            <div role="status" className="mx-auto mb-6 max-w-md text-sm text-destructive">
              Quiz complete, but your progress could not be saved. Check your connection
              and try again.
              <button
                type="button"
                className="ml-2 underline underline-offset-4"
                onClick={async () => {
                  if (!user) return;
                  setSaving(true);
                  markLessonCompleted(lesson);
                  try {
                    await saveLessonCompletion(user.uid, lesson);
                    setSaveError(false);
                  } catch {
                    setSaveError(true);
                    unmarkLessonCompleted(lesson);
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
              >
                {saving ? "Saving…" : "Try again"}
              </button>
            </div>
          )}
          {!user && (
            <p className="mb-6 text-sm text-muted-foreground">
              <Link href="/login" className="text-primary underline underline-offset-4">
                Sign in
              </Link>{" "}
              to save this lesson to your progress.
            </p>
          )}
          <Link
            href={nextLesson?.href ?? lesson.href}
            className={buttonVariants({ size: "lg" })}
          >
            {nextLesson ? `Continue to ${nextLesson.title}` : `Return to ${lesson.title}`}
          </Link>
        </div>
      ) : (
        question && (
          <article
            key={stepIndex}
            className="rounded-2xl border bg-card px-5 py-7 shadow-sm sm:px-8 sm:py-9"
          >
            <div className="mx-auto max-w-2xl text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {question.typeLabel}
              </p>
              <h1 className="mb-3 font-heading text-3xl leading-tight tracking-tight sm:text-4xl">
                {question.title}
              </h1>
              <P className="mx-auto mb-0 max-w-xl text-balance text-muted-foreground">
                {question.prompt}
              </P>
            </div>

            <div className="mt-7">{question.renderAnswer(setPassed)}</div>

            <div className="mt-7">
              {(passed !== null || question.pendingMessage) && (
                <p
                  role="status"
                  className={cn(
                    "mb-4 text-center text-sm leading-6",
                    passed === true
                      ? "text-foreground"
                      : passed === false
                        ? "text-destructive"
                        : "text-muted-foreground"
                  )}
                >
                  {passed === true
                    ? (question.passedMessage ?? "Correct. You can continue.")
                    : passed === false
                      ? (question.failedMessage ?? "Not quite yet. Update your answer and try again.")
                      : question.pendingMessage}
                </p>
              )}
              <nav
                aria-label="Quiz item navigation"
                className="flex items-center justify-between gap-4"
              >
                {stepIndex > 0 ? (
                  <LessonPagerButton
                    direction="previous"
                    label="Previous"
                    title={questions[stepIndex - 1]!.title}
                    onClick={() => {
                      setStepIndex((current) => current - 1);
                      setPassed(null);
                    }}
                  />
                ) : (
                  <span />
                )}
                <LessonPagerButton
                  direction="next"
                  label={stepIndex === questions.length - 1 ? "Finish quiz" : "Next"}
                  title={
                    stepIndex === questions.length - 1
                      ? "Quiz complete"
                      : questions[stepIndex + 1]!.title
                  }
                  disabled={passed !== true || saving}
                  onClick={continueQuiz}
                />
              </nav>
            </div>
          </article>
        )
      )}
    </section>
  );
}
