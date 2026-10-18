// lessons/js-basics/arrays/quiz/

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
    title: "Read the index",
    prompt: (
      <>
        Think about where indexes start and what happens when you read past the
        end of an array.
      </>
    ),
    ...choiceMessages,
    renderAnswer: (onResult) => (
      <MultipleChoiceQuestion
        question="What does this code print?"
        code={`
const fruits = ["apple", "banana", "cherry"];

console.log(fruits.at(-1));
console.log(fruits[3]);
`}
        choices={[
          <>
            It prints <Code>cherry</Code>, then <Code>undefined</Code>
          </>,
          <>
            It prints <Code>cherry</Code>, then throws an error
          </>,
          <>
            It prints <Code>banana</Code>, then <Code>undefined</Code>
          </>,
          <>
            It prints <Code>undefined</Code> twice
          </>,
        ]}
        answer={0}
        feedback={{
          1: "Reading an index that does not exist never throws. It gives you a different kind of result.",
          2: (
            <>
              A negative number counts from the end, so <Code>-1</Code> is the
              last item, not the middle one.
            </>
          ),
          3: (
            <>
              <Code>at(-1)</Code> does find an item. Only one of the two lines
              reaches past the end.
            </>
          ),
        }}
        explanation={
          <>
            <Code>at(-1)</Code> reads the last item, <Code>cherry</Code>. The
            array only has indexes 0 to 2, so <Code>fruits[3]</Code> gives{" "}
            <Code>undefined</Code> instead of an error.
          </>
        }
        onResult={onResult}
      />
    ),
  },
  {
    typeLabel: "Coding challenge",
    title: "Double the big ones",
    prompt: (
      <>
        Keep only the numbers greater than 20, then double each one that is
        left. Return the result as a new array.
      </>
    ),
    ...codingMessages,
    renderAnswer: (onResult) => (
      <CodingChallenge
        starterCode={`function doubleBigNumbers(numbers) {
  // code here
}`}
        challenge={{
          functionName: "doubleBigNumbers",
          testCases: [
            { args: [[10, 25, 40]], expected: [50, 80] },
            { args: [[5, 30, 1]], expected: [60] },
            { args: [[]], expected: [], hidden: true },
            { args: [[21, 20, 100]], expected: [42, 200], hidden: true },
            { args: [[1, 2, 3]], expected: [], hidden: true },
            { args: [[20, 21]], expected: [42], hidden: true },
            { args: [[-1, 22]], expected: [44], hidden: true },
            { args: [[100, 0, 50]], expected: [200, 100], hidden: true },
            { args: [[20, 20]], expected: [], hidden: true },
            { args: [[30, 31, 22]], expected: [60, 62, 44], hidden: true },
          ],
        }}
        onResult={onResult}
      />
    ),
  },
  {
    typeLabel: "Predict the output",
    title: "Two names, one array",
    prompt: (
      <>
        Work out which variables share an array and which ones hold a separate
        copy before you pick an answer.
      </>
    ),
    ...choiceMessages,
    renderAnswer: (onResult) => (
      <MultipleChoiceQuestion
        question="What does this code print?"
        code={`
const a = [1, 2, 3];
const b = a;
b.push(4);

console.log(a.length);
console.log(a === [...b]);
`}
        choices={[
          "3, then true",
          "4, then true",
          "4, then false",
          "3, then false",
        ]}
        answer={2}
        feedback={{
          0: (
            <>
              <Code>const b = a</Code> does not copy the array. Both names point
              at the same one, so <Code>a</Code> sees the push.
            </>
          ),
          1: (
            <>
              Spread builds a brand new array every time, and two separate arrays
              are never equal with <Code>===</Code>, even with the same items.
            </>
          ),
          3: (
            <>
              <Code>const b = a</Code> does not copy the array, so the push is
              visible through <Code>a</Code>.
            </>
          ),
        }}
        explanation={
          <>
            <Code>a</Code> and <Code>b</Code> are the same array, so the length
            is 4. <Code>[...b]</Code> is a new array, and{" "}
            <Code>===</Code> compares whether they are the same array, not
            whether the contents match, so the result is false.
          </>
        }
        onResult={onResult}
      />
    ),
  },
  {
    typeLabel: "Fix the bug",
    title: "Fix the order",
    prompt: (
      <>
        This function returns the numbers in the wrong order for some inputs.
        Fix it so they always come back smallest first.
      </>
    ),
    ...codingMessages,
    renderAnswer: (onResult) => (
      <CodingChallenge
        starterCode={`function sortNumbers(numbers) {
  const sorted = numbers.toSorted();

  return sorted;
}`}
        challenge={{
          functionName: "sortNumbers",
          testCases: [
            { args: [[10, 1, 9]], expected: [1, 9, 10] },
            { args: [[3, 2, 1]], expected: [1, 2, 3] },
            { args: [[100, 25, 5, 50]], expected: [5, 25, 50, 100], hidden: true },
            { args: [[]], expected: [], hidden: true },
            { args: [[5, 1, 2, 10]], expected: [1, 2, 5, 10], hidden: true },
            { args: [[-3, 0, -10, 2]], expected: [-10, -3, 0, 2], hidden: true },
            { args: [[7]], expected: [7], hidden: true },
            { args: [[2, 2, 1]], expected: [1, 2, 2], hidden: true },
            { args: [[50, 1000, 9]], expected: [9, 50, 1000], hidden: true },
            { args: [[12, -1]], expected: [-1, 12], hidden: true },
          ],
        }}
        onResult={onResult}
      />
    ),
  },
  {
    typeLabel: "Select all that apply",
    title: "Which ones mutate?",
    prompt: <>Recall the two tables from the lesson: changing methods and methods that leave the array alone.</>,
    ...choiceMessages,
    pendingMessage: "Select your answers and check them to continue.",
    renderAnswer: (onResult) => (
      <MultipleChoiceQuestion
        question="Which of these methods change the array they are called on?"
        choices={[
          <Code key="push">push(item)</Code>,
          <Code key="map">map(fn)</Code>,
          <Code key="splice">splice(i, n)</Code>,
          <Code key="filter">filter(fn)</Code>,
          <Code key="sort">sort(fn)</Code>,
          <Code key="slice">slice(start, end)</Code>,
          <Code key="toSorted">toSorted(fn)</Code>,
          <Code key="reverse">reverse()</Code>,
        ]}
        answer={[0, 2, 4, 7]}
        hint="At least one of your selections is wrong or missing. Ask of each method whether it hands back a new array or edits the original."
        explanation={
          <>
            <Code>push</Code>, <Code>splice</Code>, <Code>sort</Code>, and{" "}
            <Code>reverse</Code> edit the original array. <Code>map</Code>,{" "}
            <Code>filter</Code>, <Code>slice</Code>, and <Code>toSorted</Code>{" "}
            return something new and leave it alone.
          </>
        }
        onResult={onResult}
      />
    ),
  },
  {
    typeLabel: "Coding challenge",
    title: "Find the first long word",
    prompt: (
      <>
        Return the first word that is longer than <Code>minLength</Code>. If no
        word is long enough, return the string <Code>&quot;none&quot;</Code>.
      </>
    ),
    ...codingMessages,
    renderAnswer: (onResult) => (
      <CodingChallenge
        starterCode={`function findFirstLong(words, minLength) {
  // code here
}`}
        challenge={{
          functionName: "findFirstLong",
          testCases: [
            { args: [["apple", "banana", "cherry"], 5], expected: "banana" },
            { args: [["a", "bb"], 3], expected: "none" },
            { args: [["kiwi", "fig", "papaya"], 4], expected: "papaya", hidden: true },
            { args: [[], 1], expected: "none", hidden: true },
            { args: [["alpha", "beta"], 5], expected: "none", hidden: true },
            { args: [["cat", "elephant", "dog"], 3], expected: "elephant", hidden: true },
            { args: [["longer", "okay"], 5], expected: "longer", hidden: true },
            { args: [["", "hi"], 1], expected: "hi", hidden: true },
            { args: [["abcd", "wxyz"], 4], expected: "none", hidden: true },
            { args: [["a", "bigger"], 2], expected: "bigger", hidden: true },
          ],
        }}
        onResult={onResult}
      />
    ),
  },
  {
    typeLabel: "Coding challenge",
    title: "Total the cart",
    prompt: (
      <>
        Add up every price in the array with <Code>reduce</Code>. An empty cart
        totals 0.
      </>
    ),
    ...codingMessages,
    renderAnswer: (onResult) => (
      <CodingChallenge
        starterCode={`function sumPrices(prices) {
  // code here
}`}
        challenge={{
          functionName: "sumPrices",
          testCases: [
            { args: [[10, 25, 40]], expected: 75 },
            { args: [[5]], expected: 5 },
            { args: [[]], expected: 0, hidden: true },
            { args: [[1.5, 2.5]], expected: 4, hidden: true },
            { args: [[1, 2, 3]], expected: 6, hidden: true },
            { args: [[0, 0]], expected: 0, hidden: true },
            { args: [[10.25, 2.75]], expected: 13, hidden: true },
            { args: [[100, 200, 300]], expected: 600, hidden: true },
            { args: [[9.99]], expected: 9.99, hidden: true },
            { args: [[2, 3, 4, 5]], expected: 14, hidden: true },
          ],
        }}
        onResult={onResult}
      />
    ),
  },
];

export function ArraysQuiz({ lesson }: { lesson: Lesson }) {
  return (
    <LessonQuiz
      lesson={lesson}
      questions={questions}
      completionMessage={`You passed all ${questions.length} questions. Nice work putting arrays into practice.`}
    />
  );
}
