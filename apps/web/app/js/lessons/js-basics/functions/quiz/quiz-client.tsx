// lessons/js-basics/functions/quiz/

"use client";

import { CodingChallenge } from "@/components/lesson/coding-challenge";
import { Code } from "@/components/lesson/lesson-ui";
import { LessonQuiz, type LessonQuizQuestion } from "@/components/lesson/lesson-quiz";
import { MultipleChoiceQuestion } from "@/components/lesson/multiple-choice-question";
import type { Lesson } from "@/lib/lessons";

const codingMessages = {
  passedMessage: "All tests passed. You can continue.",
  failedMessage: "Some tests are still failing. Update your code and run it again.",
};

const choiceMessages = {
  pendingMessage: "Choose an answer and check it to continue.",
  passedMessage: "Correct. You can continue.",
  failedMessage: "Not quite. Change your answer and check again.",
};

const questions: LessonQuizQuestion[] = [
  {
    typeLabel: "Predict the output",
    title: "Call it early",
    prompt: (
      <>
        Think about how a function declaration and a <Code>const</Code> arrow
        function are each hoisted.
      </>
    ),
    ...choiceMessages,
    renderAnswer: (onResult) => (
      <MultipleChoiceQuestion
        question="What happens when this code runs?"
        code={`
console.log(early());
function early() {
  return "ok";
}

console.log(late());
const late = () => "ok";
`}
        choices={[
          <>
            It prints <Code>ok</Code> twice
          </>,
          <>
            It prints <Code>ok</Code>, then throws a <Code>ReferenceError</Code>
          </>,
          <>
            It throws a <Code>ReferenceError</Code> before printing anything
          </>,
          <>
            It prints <Code>undefined</Code>, then throws a{" "}
            <Code>ReferenceError</Code>
          </>,
        ]}
        answer={1}
        feedback={{
          0: "One of these functions is a declaration and the other is stored in a const. They are not hoisted the same way.",
          2: (
            <>
              An error happens when the failing line runs, not before. Does the
              first <Code>console.log</Code> have a problem?
            </>
          ),
          3: "A function declaration is hoisted completely, body included, so the first call returns its real value.",
        }}
        explanation={
          <>
            A declaration is hoisted whole, so <Code>early()</Code> works before
            its line and prints <Code>ok</Code>. The arrow function lives in a{" "}
            <Code>const</Code>, which cannot be used before its line runs, so{" "}
            <Code>late()</Code> throws a <Code>ReferenceError</Code>.
          </>
        }
        onResult={onResult}
      />
    ),
  },
  {
    typeLabel: "Coding challenge",
    title: "Average anything",
    prompt: (
      <>
        Use a rest parameter to accept any number of values, and return their
        average.
      </>
    ),
    ...codingMessages,
    renderAnswer: (onResult) => (
      <CodingChallenge
        starterCode={`function average(...numbers) {
  // code here
}`}
        challenge={{
          functionName: "average",
          testCases: [
            { args: [2, 4, 6], expected: 4 },
            { args: [10], expected: 10 },
            { args: [1, 2, 3, 4], expected: 2.5, hidden: true },
            { args: [5, 15], expected: 10, hidden: true },
            { args: [8, 12], expected: 10, hidden: true },
            { args: [0, 10, 20], expected: 10, hidden: true },
            { args: [-2, 2], expected: 0, hidden: true },
            { args: [1, 2], expected: 1.5, hidden: true },
            { args: [3, 6, 9, 12], expected: 7.5, hidden: true },
            { args: [-5, -1, -3], expected: -3, hidden: true },
          ],
        }}
        onResult={onResult}
      />
    ),
  },
  {
    typeLabel: "Coding challenge",
    title: "Friendly defaults",
    prompt: (
      <>
        Give <Code>name</Code> a default of <Code>&quot;friend&quot;</Code> and{" "}
        <Code>punctuation</Code> a default of <Code>&quot;!&quot;</Code>, then
        return the greeting. Match the examples.
      </>
    ),
    ...codingMessages,
    renderAnswer: (onResult) => (
      <CodingChallenge
        starterCode={`function greet(name, punctuation) {
  // code here
}`}
        challenge={{
          functionName: "greet",
          testCases: [
            { args: [], expected: "Hello, friend!" },
            { args: ["Ada", "?"], expected: "Hello, Ada?" },
            { args: ["Grace"], expected: "Hello, Grace!", hidden: true },
            { args: ["Linus", "."], expected: "Hello, Linus.", hidden: true },
            { args: ["Mina", "..."], expected: "Hello, Mina...", hidden: true },
            { args: ["friend", "?"], expected: "Hello, friend?", hidden: true },
            { args: ["Sam", "!!"], expected: "Hello, Sam!!", hidden: true },
            { args: ["Jo", "."], expected: "Hello, Jo.", hidden: true },
            { args: ["Taylor", "😄"], expected: "Hello, Taylor😄", hidden: true },
            { args: ["Rae", ""], expected: "Hello, Rae", hidden: true },
          ],
        }}
        onResult={onResult}
      />
    ),
  },
  {
    typeLabel: "Fix the bug",
    title: "The silent line",
    prompt: (
      <>
        Negative numbers come back unchanged. Read the code and fix it so every
        input returns its absolute value.
      </>
    ),
    ...codingMessages,
    renderAnswer: (onResult) => (
      <CodingChallenge
        starterCode={`function absolute(n) {
  if (n < 0) {
    -n;
  }

  return n;
}`}
        challenge={{
          functionName: "absolute",
          testCases: [
            { args: [-5], expected: 5 },
            { args: [3], expected: 3 },
            { args: [0], expected: 0, hidden: true },
            { args: [-12], expected: 12, hidden: true },
            { args: [-1], expected: 1, hidden: true },
            { args: [100], expected: 100, hidden: true },
            { args: [-0.5], expected: 0.5, hidden: true },
            { args: [-1.25], expected: 1.25, hidden: true },
            { args: [999], expected: 999, hidden: true },
            { args: [-42], expected: 42, hidden: true },
          ],
        }}
        onResult={onResult}
      />
    ),
  },
  {
    typeLabel: "Predict the output",
    title: "Functions in a loop",
    prompt: (
      <>
        Count how many <Code>i</Code> variables exist, and what value they hold
        once the loop has finished.
      </>
    ),
    ...choiceMessages,
    renderAnswer: (onResult) => (
      <MultipleChoiceQuestion
        question="What does this code print?"
        code={`
const fns = [];
for (var i = 0; i < 3; i++) {
  fns.push(() => i);
}

console.log(fns.map((fn) => fn()));
`}
        choices={[
          <Code key="a">[0, 1, 2]</Code>,
          <Code key="b">[3, 3, 3]</Code>,
          <Code key="c">[2, 2, 2]</Code>,
          <Code key="d">[undefined, undefined, undefined]</Code>,
        ]}
        answer={1}
        feedback={{
          0: (
            <>
              That is what a <Code>let</Code> loop would give. Here the loop uses{" "}
              <Code>var</Code>.
            </>
          ),
          2: "The loop does not stop at the last index that passed the test. Check what value i has when the loop condition fails.",
          3: "The variable exists and holds a number by the time the functions run.",
        }}
        explanation={
          <>
            A <Code>var</Code> loop has one shared <Code>i</Code>. The loop ends
            when it reaches 3, and every function reads that same variable
            later, so each one returns 3.
          </>
        }
        onResult={onResult}
      />
    ),
  },
  {
    typeLabel: "Coding challenge",
    title: "Count the clicks",
    prompt: (
      <>
        A counter factory is already provided. Call{" "}
        <Code>counter.increment()</Code> once per click, then return the current
        value from <Code>counter.value()</Code>.
      </>
    ),
    ...codingMessages,
    renderAnswer: (onResult) => (
      <CodingChallenge
        starterCode={`function createCounter(start) {
  let count = start;

  return {
    increment: () => ++count,
    value: () => count,
  };
}

function countClicks(start, clicks) {
  const counter = createCounter(start);

  // code here
}`}
        challenge={{
          functionName: "countClicks",
          testCases: [
            { args: [0, 3], expected: 3 },
            { args: [10, 2], expected: 12 },
            { args: [5, 0], expected: 5, hidden: true },
            { args: [100, 4], expected: 104, hidden: true },
            { args: [0, 0], expected: 0, hidden: true },
            { args: [-5, 3], expected: -2, hidden: true },
            { args: [1, 1], expected: 2, hidden: true },
            { args: [40, 10], expected: 50, hidden: true },
            { args: [7, 2], expected: 9, hidden: true },
            { args: [-2, 0], expected: -2, hidden: true },
          ],
        }}
        onResult={onResult}
      />
    ),
  },
  {
    typeLabel: "Predict the output",
    title: "Whose this is it?",
    prompt: (
      <>
        A regular function and an arrow function each get a <Code>this</Code>{" "}
        in a different way. Decide where each one comes from.
      </>
    ),
    ...choiceMessages,
    renderAnswer: (onResult) => (
      <MultipleChoiceQuestion
        question="What does this code print?"
        code={`
const timer = {
  seconds: 30,
  start() {
    setTimeout(function () {
      console.log(this.seconds);
    }, 0);
    setTimeout(() => {
      console.log(this.seconds);
    }, 0);
  },
};

timer.start();
`}
        choices={[
          <>
            <Code>30</Code>, then <Code>30</Code>
          </>,
          <>
            <Code>undefined</Code>, then <Code>30</Code>
          </>,
          <>
            <Code>30</Code>, then <Code>undefined</Code>
          </>,
          <>
            <Code>undefined</Code>, then <Code>undefined</Code>
          </>,
        ]}
        answer={1}
        feedback={{
          0: (
            <>
              Only one of the two callbacks borrows <Code>this</Code> from{" "}
              <Code>start</Code>. The other works out its own.
            </>
          ),
          2: "You have the two callbacks the wrong way round. Which one has no this of its own?",
          3: (
            <>
              One callback does not have its own <Code>this</Code>, so it uses
              the one from the method around it.
            </>
          ),
        }}
        explanation={
          <>
            The regular function gets its own <Code>this</Code>, which is not{" "}
            <Code>timer</Code> when <Code>setTimeout</Code> calls it, so{" "}
            <Code>this.seconds</Code> is <Code>undefined</Code>. The arrow
            function has no <Code>this</Code> of its own and uses the one from{" "}
            <Code>start</Code>, which is <Code>timer</Code>, so it prints 30.
          </>
        }
        onResult={onResult}
      />
    ),
  },
  {
    typeLabel: "Coding challenge",
    title: "Sum any depth",
    prompt: (
      <>
        Add up every number in an array, even when arrays are nested inside
        arrays. A function that calls itself handles unknown depth, and{" "}
        <Code>Array.isArray</Code> tells you when to recurse.
      </>
    ),
    ...codingMessages,
    renderAnswer: (onResult) => (
      <CodingChallenge
        starterCode={`function sumAll(items) {
  let total = 0;

  // code here

  return total;
}`}
        challenge={{
          functionName: "sumAll",
          testCases: [
            { args: [[1, [2, [3, 4]], 5]], expected: 15 },
            { args: [[1, 2, 3]], expected: 6 },
            { args: [[]], expected: 0, hidden: true },
            { args: [[[[5]]]], expected: 5, hidden: true },
            { args: [[10, [20], [[30]]]], expected: 60, hidden: true },
            { args: [[1, [], 2]], expected: 3, hidden: true },
            { args: [[1, [[]]]], expected: 1, hidden: true },
            { args: [[-1, [2, -3]]], expected: -2, hidden: true },
            { args: [[0, [0]]], expected: 0, hidden: true },
            { args: [[2, [[3], 4], -1]], expected: 8, hidden: true },
          ],
        }}
        onResult={onResult}
      />
    ),
  },
];

export function FunctionsQuiz({ lesson }: { lesson: Lesson }) {
  return (
    <LessonQuiz
      lesson={lesson}
      questions={questions}
      completionMessage={`You passed all ${questions.length} questions. Nice work putting functions into practice.`}
    />
  );
}
