"use client";

import { useId, useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { HighlightedCode } from "@/components/lesson/highlighted-code";

interface MultipleChoiceQuestionProps {
  question: string;
  // Optional snippet shown above the choices. Display only, so learners have to
  // work it out instead of running it.
  code?: string;
  choices: ReactNode[];
  // One index for "choose one", an array of indexes for "select all that apply"
  answer: number | number[];
  // Shown only after a correct answer, so a wrong answer never gives it away
  explanation: ReactNode;
  // "Choose one": choice index -> why that choice is wrong, without naming the right one
  feedback?: Partial<Record<number, ReactNode>>;
  // "Select all": shown after a wrong answer, without saying which choices are wrong
  hint?: ReactNode;
  onResult?: (passed: boolean | null) => void;
}

function QuestionCode({ code }: { code: string }) {
  const text = code.trim();
  const lineNumbers = text
    .split("\n")
    .map((_, index) => index + 1)
    .join("\n");

  return (
    <div className="flex overflow-hidden rounded-lg border bg-muted/30 font-mono text-sm leading-6">
      <pre
        aria-hidden="true"
        className="select-none border-r bg-muted/50 px-3 py-3 text-right text-muted-foreground"
      >
        {lineNumbers}
      </pre>
      <pre className="overflow-x-auto px-4 py-3">
        <code>
          <HighlightedCode code={text} />
        </code>
      </pre>
    </div>
  );
}

export function MultipleChoiceQuestion({
                                         question,
                                         code,
                                         choices,
                                         answer,
                                         explanation,
                                         feedback,
                                         hint,
                                         onResult,
                                       }: MultipleChoiceQuestionProps) {
  const groupName = useId();
  const multiple = Array.isArray(answer);
  const correct = Array.isArray(answer) ? answer : [answer];
  const [selected, setSelected] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);

  const isCorrect =
    selected.length === correct.length &&
    correct.every((index) => selected.includes(index));
  // Once the answer is right the choices lock, so it can't be undone by accident
  const locked = checked && isCorrect;

  function choose(index: number) {
    setSelected((current) => {
      if (!multiple) return [index];
      return current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index];
    });
    setChecked(false);
    onResult?.(null);
  }

  // A wrong answer only ever gets feedback about what was picked, never the answer itself
  const wrongMessage = multiple ? hint : feedback?.[selected[0] ?? -1];
  const message = !checked ? null : isCorrect ? (
    <>
      {"That’s right. "}
      {explanation}
    </>
  ) : (
    wrongMessage
  );

  return (
    <fieldset className="my-6 space-y-4">
      <legend className="mb-4 font-medium">
        {question}
        {multiple && (
          <span className="mt-1 block text-sm font-normal text-muted-foreground">
            Select all that apply.
          </span>
        )}
      </legend>

      {code && <QuestionCode code={code} />}

      <div className="space-y-2">
        {choices.map((choice, index) => {
          const isSelected = selected.includes(index);
          // Only a single-answer question can mark the picked choice as wrong without
          // exposing the answer; with several answers, marking would give it away
          const isWrongPick = checked && !isCorrect && !multiple && isSelected;
          const tone = isWrongPick
            ? "wrong"
            : locked && isSelected
              ? "correct"
              : isSelected
                ? "selected"
                : "idle";

          return (
            <label
              key={index}
              className={cn(
                "flex items-center gap-3 rounded-md border px-4 py-3 transition-colors",
                locked ? "cursor-default" : "cursor-pointer",
                // Hover is lighter than selected, so a selected choice always reads as the stronger one
                tone === "idle" && !locked && "hover:bg-muted/50",
                tone === "selected" && "border-primary/50 bg-muted",
                tone === "correct" && "border-primary bg-primary/5",
                tone === "wrong" && "border-destructive bg-muted"
              )}
            >
              <input
                type={multiple ? "checkbox" : "radio"}
                name={groupName}
                value={index}
                checked={isSelected}
                disabled={locked}
                onChange={() => choose(index)}
                className="accent-primary"
              />
              <span>{choice}</span>
            </label>
          );
        })}
      </div>

      <Button
        type="button"
        disabled={selected.length === 0 || checked}
        onClick={() => {
          setChecked(true);
          onResult?.(isCorrect);
        }}
      >
        Check answer
      </Button>

      {message && (
        <p
          role="status"
          className={cn(
            // bg-muted/50, like the Tip callouts, so inline code chips (bg-muted) stay visible
            "block rounded-md bg-muted/50 px-4 py-3 text-sm leading-6",
            isCorrect ? "text-foreground" : "text-destructive"
          )}
        >
          {message}
        </p>
      )}
    </fieldset>
  );
}
