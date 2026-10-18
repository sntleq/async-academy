"use client";

import {
  CodePlayground,
  formatValue,
  type PlaygroundChallenge,
} from "@/components/lesson/code-playground";
import { Code } from "@/components/lesson/lesson-ui";

export function CodingChallenge({
                                  starterCode,
                                  challenge,
                                  onResult,
                                  title = "Your solution",
                                }: {
  starterCode: string;
  challenge: PlaygroundChallenge;
  onResult: (passed: boolean | null) => void;
  title?: string;
}) {
  const examples = challenge.testCases.filter((testCase) => !testCase.hidden);
  const returnVariable = challenge.returnVariable;

  return (
    <>
      <div className="w-full rounded-xl border bg-muted/30 p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">Examples</h2>
          <span className="text-xs text-muted-foreground">
            {examples.length} {examples.length === 1 ? "example" : "examples"}
          </span>
        </div>
        <ol className="space-y-3">
          {examples.map((testCase, index) => (
            <li key={index} className="rounded-lg border bg-background p-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Case {index + 1}
              </p>
              <div className="space-y-2">
                <div className="min-w-0 rounded-md bg-muted/50 px-3 py-2">
                  <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Input
                  </p>
                  <code className="block break-all font-mono text-sm">
                    {`${challenge.functionName}(${testCase.args
                      .map(formatValue)
                      .join(", ")})`}
                  </code>
                </div>
                <div className="min-w-0 rounded-md bg-muted/50 px-3 py-2">
                  <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Expected
                  </p>
                  <code className="block break-all font-mono text-sm">
                    {formatExpectedValue(testCase.expected)}
                  </code>
                </div>
              </div>
            </li>
          ))}
        </ol>

        {returnVariable && (
          <div className="mt-4">
            <h2 className="mb-1 text-sm font-semibold">Requirement</h2>
            <p className="text-sm leading-6">
              Store the result in a{" "}
              {returnVariable.keyword ? (
                <Code>{returnVariable.keyword}</Code>
              ) : (
                "variable"
              )}{" "}
              named <Code>{returnVariable.name}</Code> and return it.
            </p>
          </div>
        )}

        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          Your solution will also be checked against additional test cases.
        </p>
      </div>

      <CodePlayground
        code={starterCode}
        title={title}
        challenge={challenge}
        onChallengeResult={onResult}
      />
    </>
  );
}

function formatExpectedValue(value: unknown) {
  return typeof value === "string" ? value : formatValue(value);
}
