// lessons/design-patterns/module/quiz/

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
    typeLabel: "Quick check",
    title: "What keeps it private?",
    prompt: (
      <>
        Think about where <Code>count</Code> lives and what can reach it.
      </>
    ),
    ...choiceMessages,
    renderAnswer: (onResult) => (
      <MultipleChoiceQuestion
        question="What keeps count private in this module?"
        code={`
const counter = (function () {
  let count = 0;

  return {
    increment() {
      count++;
      return count;
    },
  };
})();
`}
        choices={[
          "It lives in the function scope of the IIFE, and only the returned functions can reach it",
          <>
            The <Code>let</Code> keyword makes a variable private
          </>,
          "Hoisting moves it out of reach of other code",
          "The returned object holds a hidden copy of it",
        ]}
        answer={0}
        feedback={{
          1: (
            <>
              <Code>let</Code> only controls block scope. Privacy here comes from
              where the variable is declared.
            </>
          ),
          2: "Hoisting registers declarations. It does not hide them from anyone.",
          3: "The returned functions use the variable itself, not a copy of it.",
        }}
        explanation={
          <>
            The IIFE gives <Code>count</Code> a function scope that outside code
            cannot see. <Code>increment</Code> keeps working with it because of
            a closure.
          </>
        }
        onResult={onResult}
      />
    ),
  },
  {
    typeLabel: "Predict the output",
    title: "Reaching in from outside",
    prompt: (
      <>
        Decide whether the assignment can reach the private variable, or only
        adds something to the returned object.
      </>
    ),
    ...choiceMessages,
    renderAnswer: (onResult) => (
      <MultipleChoiceQuestion
        question="What does this code print?"
        code={`
const counter = (function () {
  let count = 0;

  return {
    increment() {
      count++;
      return count;
    },
    value() {
      return count;
    },
  };
})();

counter.increment();
counter.count = 99;

console.log(counter.value());
console.log(counter.count);
`}
        choices={["1, then 99", "99, then 99", "1, then undefined", "99, then undefined"]}
        answer={0}
        feedback={{
          1: (
            <>
              <Code>value</Code> reads the private variable. Did the assignment
              touch it?
            </>
          ),
          2: "The assignment ran before the second log. It created something on the returned object.",
          3: "Check each line separately. The first reads the private variable, the second reads a property.",
        }}
        explanation={
          <>
            <Code>counter.count = 99</Code> only adds a new property to the
            returned object. The private <Code>count</Code> is still 1, so{" "}
            <Code>value()</Code> gives 1 while <Code>counter.count</Code> gives
            99.
          </>
        }
        onResult={onResult}
      />
    ),
  },
  {
    typeLabel: "Coding challenge",
    title: "Finish the cart module",
    prompt: (
      <>
        Finish the module. Keep <Code>list</Code> private, and return an object
        that reveals <Code>add(name, price)</Code>, <Code>total()</Code>, and{" "}
        <Code>count()</Code>.
      </>
    ),
    ...codingMessages,
    renderAnswer: (onResult) => (
      <CodingChallenge
        starterCode={`function cartSummary(items) {
  const cart = (function () {
    const list = [];

    // code here
  })();

  items.forEach(([name, price]) => cart.add(name, price));

  return "count: " + cart.count() + ", total: " + cart.total();
}`}
        challenge={{
          functionName: "cartSummary",
          testCases: [
            { args: [[["Book", 12], ["Pen", 3]]], expected: "count: 2, total: 15" },
            { args: [[]], expected: "count: 0, total: 0" },
            { args: [[["Lamp", 20]]], expected: "count: 1, total: 20", hidden: true },
            {
              args: [[["A", 1.5], ["B", 2.5], ["C", 4]]],
              expected: "count: 3, total: 8",
              hidden: true,
            },
          ],
        }}
        onResult={onResult}
      />
    ),
  },
  {
    typeLabel: "Predict the output",
    title: "Pulling a function out",
    prompt: (
      <>
        Remember that the functions in a revealing module call each other by
        plain name, not through <Code>this</Code>.
      </>
    ),
    ...choiceMessages,
    renderAnswer: (onResult) => (
      <MultipleChoiceQuestion
        question="What does this code print?"
        code={`
const wallet = (function () {
  let coins = 0;

  function add() {
    coins++;
  }

  function total() {
    return coins;
  }

  return { add, total };
})();

const { add } = wallet;
add();
add();

console.log(wallet.total());
`}
        choices={[
          "2",
          "0",
          <>
            It throws a <Code>TypeError</Code> because <Code>add</Code> lost its{" "}
            <Code>this</Code>
          </>,
          <Code key="undefined">undefined</Code>,
        ]}
        answer={0}
        feedback={{
          1: (
            <>
              <Code>add</Code> was called twice. Does pulling it out of the
              object break it?
            </>
          ),
          2: (
            <>
              <Code>add</Code> never uses <Code>this</Code>. It changes a
              variable in the scope around it.
            </>
          ),
          3: (
            <>
              <Code>total</Code> returns a number, not <Code>undefined</Code>.
            </>
          ),
        }}
        explanation={
          <>
            <Code>add</Code> works with the private <Code>coins</Code> variable
            directly, so it still works after being pulled out of the object.
            Two calls make the total 2.
          </>
        }
        onResult={onResult}
      />
    ),
  },
  {
    typeLabel: "Coding challenge",
    title: "Extend a namespace",
    prompt: (
      <>
        In the second IIFE, set <Code>app.report</Code> to a function that
        returns <Code>Total visits: </Code> followed by <Code>app.visits()</Code>.
        <Code>runApp</Code> already calls <Code>App.report()</Code> after the
        visits, so add the method to the namespace instead of building the text
        in <Code>runApp</Code>.
      </>
    ),
    ...codingMessages,
    renderAnswer: (onResult) => (
      <CodingChallenge
        starterCode={`function runApp(visitCount) {
  const App = {};

  (function (app) {
    let visits = 0;
    app.visit = () => ++visits;
    app.visits = () => visits;
  })(App);

  (function (app) {
    // code here
  })(App);

  for (let i = 0; i < visitCount; i++) {
    App.visit();
  }

  return App.report();
}`}
        challenge={{
          functionName: "runApp",
          testCases: [
            { args: [2], expected: "Total visits: 2" },
            { args: [0], expected: "Total visits: 0" },
            { args: [5], expected: "Total visits: 5", hidden: true },
            { args: [1], expected: "Total visits: 1", hidden: true },
          ],
        }}
        onResult={onResult}
      />
    ),
  },
  {
    typeLabel: "Select all that apply",
    title: "The IIFE module",
    prompt: <>Think about what the pattern gives you, and what the lesson listed as its downsides.</>,
    ...choiceMessages,
    pendingMessage: "Select your answers and check them to continue.",
    renderAnswer: (onResult) => (
      <MultipleChoiceQuestion
        question="Which statements about the IIFE module pattern are true?"
        choices={[
          "Variables inside the IIFE stay private unless the returned object exposes them",
          "Private functions can be tested directly from outside",
          "The IIFE runs once, so the module is a singleton",
          "It is the recommended choice for new code",
          "Modules that depend on each other must be loaded in the right order by hand",
          "Every call to the module creates a fresh copy",
        ]}
        answer={[0, 2, 4]}
        hint="At least one of your selections is wrong or missing. Think about how often an IIFE runs, and what the lesson listed as downsides."
        explanation={
          <>
            Only what the IIFE returns is public, and since it runs once there is
            only one module. Its downsides are that private functions cannot be
            tested directly and that load order is managed by hand. For new
            code, built-in modules are preferred.
          </>
        }
        onResult={onResult}
      />
    ),
  },
  {
    typeLabel: "Coding challenge",
    title: "Modern modules",
    prompt: (
      <>
        Finish <Code>runApp</Code> in <Code>app.js</Code>. Use the exported
        functions from <Code>counter.js</Code> to increment the counter the
        requested number of times, then return a two-item array containing
        <Code>value()</Code> and <Code>typeof count</Code>. The counter stays
        private in its own file, so call the exported <Code>reset</Code> before
        each run.
      </>
    ),
    ...codingMessages,
    renderAnswer: (onResult) => (
      <CodingChallenge
        files={{
          "counter.js": [
            "let count = 0;",
            "",
            "export function increment() {",
            "  return ++count;",
            "}",
            "",
            "export function value() {",
            "  return count;",
            "}",
            "",
            "export function reset() {",
            "  count = 0;",
            "}",
          ].join("\n"),
          "app.js": [
            'import { increment, reset, value } from "./counter.js";',
            "",
            "function runApp(increments) {",
            "  // code here",
            "}",
          ].join("\n"),
        }}
        entry="app.js"
        challenge={{
          functionName: "runApp",
          testCases: [
            { args: [2], expected: [2, "undefined"] },
            { args: [0], expected: [0, "undefined"] },
            { args: [4], expected: [4, "undefined"], hidden: true },
            { args: [1], expected: [1, "undefined"], hidden: true },
          ],
        }}
        onResult={onResult}
      />
    ),
  },
];

export function ModuleQuiz({ lesson }: { lesson: Lesson }) {
  return (
    <LessonQuiz
      lesson={lesson}
      questions={questions}
      completionMessage={`You passed all ${questions.length} questions. Nice work putting the Module pattern into practice.`}
    />
  );
}
