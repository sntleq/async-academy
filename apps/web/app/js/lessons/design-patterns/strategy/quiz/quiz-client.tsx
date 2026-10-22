// lessons/design-patterns/strategy/quiz/

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

// Array outputs written as text, so they can sit inside choices
const figFirst = '["Fig", "Pear", "Apple"]';
const originalOrder = '["Pear", "Apple", "Fig"]';

const questions: LessonQuizQuestion[] = [
  {
    typeLabel: "Quick check",
    title: "Name the roles",
    prompt: (
      <>
        A strategy setup has three roles: the strategy, the context, and the
        client. Match them to the code.
      </>
    ),
    ...choiceMessages,
    renderAnswer: (onResult) => (
      <MultipleChoiceQuestion
        question="Which part plays the context?"
        code={`
const shippingStrategies = {
  standard: (weight) => 5 + weight * 0.5,
  express: (weight) => 15 + weight,
};

function shippingCost(method, weight) {
  return shippingStrategies[method](weight);
}

console.log(shippingCost("express", 4));
`}
        choices={[
          <Code key="express">shippingStrategies.express</Code>,
          <Code key="cost">shippingCost</Code>,
          <Code key="call">{'shippingCost("express", 4)'}</Code>,
          <Code key="weight">weight</Code>,
        ]}
        answer={1}
        feedback={{
          0: "That is one interchangeable way of doing the job, which makes it a strategy.",
          2: "That call chooses which strategy to use, which makes it the client.",
          3: "weight is only an input that every strategy receives.",
        }}
        explanation={
          <>
            <Code>shippingCost</Code> uses a strategy without knowing which one
            it is. The functions in <Code>shippingStrategies</Code> are the
            strategies, and the caller that passes <Code>&quot;express&quot;</Code>{" "}
            is the client.
          </>
        }
        onResult={onResult}
      />
    ),
  },
  {
    typeLabel: "Coding challenge",
    title: "Look the strategy up",
    prompt: (
      <>
        Finish <Code>shippingCost</Code> so it looks the method up in{" "}
        <Code>shippingStrategies</Code> and calls the strategy with the weight.
        If the method is not there, return <Code>null</Code>.
      </>
    ),
    ...codingMessages,
    renderAnswer: (onResult) => (
      <CodingChallenge
        starterCode={`const shippingStrategies = {
  standard: (weight) => 5 + weight * 0.5,
  express: (weight) => 15 + weight,
  overnight: (weight) => 30 + weight * 2,
};

function shippingCost(method, weight) {
  // code here
}`}
        challenge={{
          functionName: "shippingCost",
          testCases: [
            { args: ["standard", 4], expected: 7 },
            { args: ["express", 4], expected: 19 },
            { args: ["overnight", 4], expected: 38, hidden: true },
            { args: ["pickup", 4], expected: null, hidden: true },
            { args: ["standard", 0], expected: 5, hidden: true },
          ],
        }}
        onResult={onResult}
      />
    ),
  },
  {
    typeLabel: "Coding challenge",
    title: "Strategies with settings",
    prompt: (
      <>
        Finish the two factories. <Code>percentOff(percent)</Code> should return
        a function that takes a price and returns it with that percentage taken
        off. <Code>flatOff(amount)</Code> should return a function that subtracts
        the amount but never goes below 0.
      </>
    ),
    ...codingMessages,
    renderAnswer: (onResult) => (
      <CodingChallenge
        starterCode={`function percentOff(percent) {
  // code here
}

function flatOff(amount) {
  // code here
}

function checkout(price, kind, value) {
  const strategies = { percent: percentOff, flat: flatOff };
  const discount = strategies[kind](value);

  return discount(price);
}`}
        challenge={{
          functionName: "checkout",
          testCases: [
            { args: [80, "percent", 25], expected: 60 },
            { args: [80, "flat", 100], expected: 0 },
            { args: [50, "flat", 10], expected: 40, hidden: true },
            { args: [90, "percent", 50], expected: 45, hidden: true },
            { args: [30, "percent", 0], expected: 30, hidden: true },
          ],
        }}
        onResult={onResult}
      />
    ),
  },
  {
    typeLabel: "Predict the output",
    title: "A strategy that sorts",
    prompt: (
      <>
        The comparison function is a strategy for ordering. Think about whether{" "}
        <Code>sort</Code> returns a copy or changes the original.
      </>
    ),
    ...choiceMessages,
    renderAnswer: (onResult) => (
      <MultipleChoiceQuestion
        question="What does this code print?"
        code={`
const products = [
  { name: "Pear", price: 3 },
  { name: "Apple", price: 5 },
  { name: "Fig", price: 1 },
];

const byPrice = (a, b) => a.price - b.price;

const sorted = products.sort(byPrice);

console.log(sorted.map(({ name }) => name));
console.log(products.map(({ name }) => name));
`}
        choices={[
          <>
            <Code>{figFirst}</Code>, then <Code>{originalOrder}</Code>
          </>,
          <>
            <Code>{figFirst}</Code> both times
          </>,
          <>
            <Code>{originalOrder}</Code>, then <Code>{figFirst}</Code>
          </>,
          <>
            <Code>{originalOrder}</Code> both times
          </>,
        ]}
        answer={1}
        feedback={{
          0: (
            <>
              That is what <Code>toSorted</Code> would do. This code uses{" "}
              <Code>sort</Code>.
            </>
          ),
          2: "The sorted result cannot come out unsorted. Check which line prints first.",
          3: (
            <>
              The comparison strategy is applied. Check what <Code>sort</Code>{" "}
              does with it.
            </>
          ),
        }}
        explanation={
          <>
            <Code>byPrice</Code> orders the items smallest price first. But{" "}
            <Code>sort</Code> changes the array it is called on and returns that
            same array, so both <Code>sorted</Code> and <Code>products</Code>{" "}
            show the sorted order.
          </>
        }
        onResult={onResult}
      />
    ),
  },
  {
    typeLabel: "Fix the bug",
    title: "Names that slip through",
    prompt: (
      <>
        Most inputs work, but some unexpected method names slip past the check.
        Fix it so only the keys that <Code>strategies</Code> holds itself are
        accepted.
      </>
    ),
    ...codingMessages,
    renderAnswer: (onResult) => (
      <CodingChallenge
        starterCode={`const strategies = {
  standard: (weight) => 5 + weight * 0.5,
  express: (weight) => 15 + weight,
};

function shippingCost(method, weight) {
  if (!(method in strategies)) return null;

  return strategies[method](weight);
}`}
        challenge={{
          functionName: "shippingCost",
          testCases: [
            { args: ["standard", 4], expected: 7 },
            { args: ["express", 4], expected: 19 },
            { args: ["pickup", 4], expected: null },
            { args: ["toString", 4], expected: null, hidden: true },
            { args: ["constructor", 1], expected: null, hidden: true },
          ],
        }}
        onResult={onResult}
      />
    ),
  },
  {
    typeLabel: "Predict the output",
    title: "A strategy with the wrong shape",
    prompt: (
      <>
        Look at what each strategy returns. Then follow what happens when the
        odd one out is used.
      </>
    ),
    ...choiceMessages,
    renderAnswer: (onResult) => (
      <MultipleChoiceQuestion
        question="What does this code print?"
        code={`
const discounts = {
  tenOff: (price) => price * 0.9,
  fiveOff: (price) => price - 5,
  half: (price) => console.log(price / 2),
};

function checkout(price, name) {
  return discounts[name](price);
}

console.log(checkout(80, "half"));
`}
        choices={[
          <>
            It prints <Code>40</Code>
          </>,
          <>
            It prints <Code>40</Code>, then <Code>undefined</Code>
          </>,
          <>
            It prints <Code>undefined</Code>
          </>,
          <>
            It throws a <Code>TypeError</Code>
          </>,
        ]}
        answer={1}
        feedback={{
          0: (
            <>
              The strategy prints 40, but what does it hand back to{" "}
              <Code>checkout</Code>?
            </>
          ),
          2: "Something is printed before the outer log runs. Follow what half does with its value.",
          3: (
            <>
              <Code>half</Code> is a valid function in the object, so the call
              works.
            </>
          ),
        }}
        explanation={
          <>
            <Code>half</Code> prints 40 itself and returns nothing, so the outer{" "}
            <Code>console.log</Code> prints <Code>undefined</Code>. Every strategy
            should take a price and return a price. Keeping that shape identical
            is what makes strategies interchangeable.
          </>
        }
        onResult={onResult}
      />
    ),
  },
  {
    typeLabel: "Select all that apply",
    title: "When to reach for it",
    prompt: <>Recall the situations the lesson listed for using the pattern.</>,
    ...choiceMessages,
    pendingMessage: "Select your answers and check them to continue.",
    renderAnswer: (onResult) => (
      <MultipleChoiceQuestion
        question="When does a strategy pay off?"
        choices={[
          "There are several ways to do the same job",
          "The right one is chosen while the program runs",
          "New ways are added over time, and old code should not change when they are",
          "There are exactly two cases that will never grow",
          "A function has more than one parameter",
          "Something must exist exactly once in the whole program",
        ]}
        answer={[0, 1, 2]}
        hint="At least one of your selections is wrong or missing. Compare each one with the list in the lesson, and watch for a different pattern in disguise."
        explanation={
          <>
            Use a strategy when there are several ways to do a job, the right one
            is picked at runtime, and new ways keep being added. Two cases that
            never grow are better served by a single <Code>if</Code>, and
            something that must exist once is a singleton.
          </>
        }
        onResult={onResult}
      />
    ),
  },
  {
    typeLabel: "Coding challenge",
    title: "Pick the ordering",
    prompt: (
      <>
        Use the <Code>by</Code> value to look up a comparison strategy in{" "}
        <Code>comparators</Code>, sort a copy of the products with it, and
        return only the names in that order.
      </>
    ),
    ...codingMessages,
    renderAnswer: (onResult) => (
      <CodingChallenge
        starterCode={`const byPrice = (a, b) => a.price - b.price;
const byName = (a, b) => a.name.localeCompare(b.name);
const comparators = { price: byPrice, name: byName };

function sortedNames(products, by) {
  // code here
}`}
        challenge={{
          functionName: "sortedNames",
          testCases: [
            {
              args: [
                [
                  { name: "Pear", price: 3 },
                  { name: "Apple", price: 5 },
                  { name: "Fig", price: 1 },
                ],
                "price",
              ],
              expected: ["Fig", "Pear", "Apple"],
              preserveArgs: true,
            },
            {
              args: [
                [
                  { name: "Pear", price: 3 },
                  { name: "Apple", price: 5 },
                  { name: "Fig", price: 1 },
                ],
                "name",
              ],
              expected: ["Apple", "Fig", "Pear"],
              preserveArgs: true,
            },
            {
              args: [
                [
                  { name: "b", price: 2 },
                  { name: "a", price: 9 },
                ],
                "name",
              ],
              expected: ["a", "b"],
              preserveArgs: true,
              hidden: true,
            },
            {
              args: [
                [
                  { name: "b", price: 2 },
                  { name: "a", price: 9 },
                ],
                "price",
              ],
              expected: ["b", "a"],
              preserveArgs: true,
              hidden: true,
            },
            { args: [[], "name"], expected: [], hidden: true, preserveArgs: true },
          ],
        }}
        onResult={onResult}
      />
    ),
  },
];

export function StrategyQuiz({ lesson }: { lesson: Lesson }) {
  return (
    <LessonQuiz
      lesson={lesson}
      questions={questions}
      completionMessage={`You passed all ${questions.length} questions. Nice work putting the Strategy pattern into practice.`}
    />
  );
}
