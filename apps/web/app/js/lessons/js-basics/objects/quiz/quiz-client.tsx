// lessons/js-basics/objects/quiz/

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
    title: "Missing properties",
    prompt: (
      <>
        One of these lines is safe when a property is missing. Decide which, then
        work out what the other one does.
      </>
    ),
    ...choiceMessages,
    renderAnswer: (onResult) => (
      <MultipleChoiceQuestion
        question="What happens when this code runs?"
        code={`
const user = { name: "Ada", address: { city: "Lisbon" } };

console.log(user.phone?.number);
console.log(user.phone.number);
`}
        choices={[
          <>
            It prints <Code>undefined</Code> twice
          </>,
          <>
            It prints <Code>undefined</Code>, then throws a{" "}
            <Code>TypeError</Code>
          </>,
          <>
            It throws a <Code>TypeError</Code> before printing anything
          </>,
          <>
            It prints <Code>Lisbon</Code>, then <Code>undefined</Code>
          </>,
        ]}
        answer={1}
        feedback={{
          0: (
            <>
              Reading a missing property gives <Code>undefined</Code>, but the
              second line reads a property of that missing value. Can you read
              anything from <Code>undefined</Code>?
            </>
          ),
          2: (
            <>
              An error happens when the failing line runs, not before. Does the
              first line have a problem?
            </>
          ),
          3: (
            <>
              Neither line reads <Code>address</Code>. Look at which property
              they both start from.
            </>
          ),
        }}
        explanation={
          <>
            <Code>user.phone</Code> is <Code>undefined</Code>. Optional chaining
            stops there and returns <Code>undefined</Code>, but plain dot access
            tries to read <Code>number</Code> from <Code>undefined</Code>, which
            throws a <Code>TypeError</Code>.
          </>
        }
        onResult={onResult}
      />
    ),
  },
  {
    typeLabel: "Coding challenge",
    title: "Build a user",
    prompt: (
      <>
        Build and return an object with <Code>name</Code> and <Code>role</Code>{" "}
        properties, using shorthand. Give <Code>role</Code> a default value of{" "}
        <Code>&quot;student&quot;</Code> for when none is passed.
      </>
    ),
    ...codingMessages,
    renderAnswer: (onResult) => (
      <CodingChallenge
        starterCode={`function createUser(name, role) {
  // code here
}`}
        challenge={{
          functionName: "createUser",
          testCases: [
            { args: ["Ada"], expected: { name: "Ada", role: "student" } },
            { args: ["Grace", "teacher"], expected: { name: "Grace", role: "teacher" } },
            { args: ["Linus"], expected: { name: "Linus", role: "student" }, hidden: true },
            { args: ["Sam", "admin"], expected: { name: "Sam", role: "admin" }, hidden: true },
            { args: ["Mina"], expected: { name: "Mina", role: "student" }, hidden: true },
            { args: ["Ava", ""], expected: { name: "Ava", role: "" }, hidden: true },
            { args: ["Sam", null], expected: { name: "Sam", role: null }, hidden: true },
            { args: ["Mia", "admin"], expected: { name: "Mia", role: "admin" }, hidden: true },
            { args: ["Noah", "guest"], expected: { name: "Noah", role: "guest" }, hidden: true },
            { args: ["Zoe", "editor"], expected: { name: "Zoe", role: "editor" }, hidden: true },
          ],
        }}
        onResult={onResult}
      />
    ),
  },
  {
    typeLabel: "Predict the output",
    title: "Who shares what?",
    prompt: (
      <>
        Decide which names point at the original object and which one holds a
        separate copy.
      </>
    ),
    ...choiceMessages,
    renderAnswer: (onResult) => (
      <MultipleChoiceQuestion
        question="What does this code print?"
        code={`
const a = { count: 1 };
const b = a;
const c = { ...a };
b.count = 2;

console.log(a.count, c.count);
`}
        choices={["1 1", "2 2", "2 1", "1 2"]}
        answer={2}
        feedback={{
          0: (
            <>
              <Code>const b = a</Code> does not copy the object. Both names point
              at it, so changing <Code>b.count</Code> changes what{" "}
              <Code>a</Code> sees.
            </>
          ),
          1: (
            <>
              <Code>c</Code> was made with spread before the change. Is it still
              connected to the original?
            </>
          ),
          3: "Think again about which names share the original object and which one holds a separate copy.",
        }}
        explanation={
          <>
            <Code>a</Code> and <Code>b</Code> are one object, so setting{" "}
            <Code>b.count</Code> shows up as <Code>a.count</Code>, which is 2.
            Spread made <Code>c</Code> a separate copy before the change, so its
            count is still 1.
          </>
        }
        onResult={onResult}
      />
    ),
  },
  {
    typeLabel: "Fix the bug",
    title: "Fix the override",
    prompt: (
      <>
        The new theme is ignored whenever <Code>settings</Code> already has one.
        Fix it so the returned object always uses the theme that was passed in.
      </>
    ),
    ...codingMessages,
    renderAnswer: (onResult) => (
      <CodingChallenge
        starterCode={`function withTheme(settings, theme) {
  const updated = { theme, ...settings };

  return updated;
}`}
        challenge={{
          functionName: "withTheme",
          testCases: [
            {
              args: [{ theme: "light", fontSize: 16 }, "dark"],
              expected: { theme: "dark", fontSize: 16 },
            },
            {
              args: [{ fontSize: 12 }, "dark"],
              expected: { fontSize: 12, theme: "dark" },
            },
            {
              args: [{ theme: "dark" }, "light"],
              expected: { theme: "light" },
              hidden: true,
            },
            {
              args: [{ theme: "blue", fontSize: 20, compact: true }, "red"],
              expected: { theme: "red", fontSize: 20, compact: true },
              hidden: true,
            },
            { args: [{}, "dark"], expected: { theme: "dark" }, hidden: true },
            { args: [{ theme: "light" }, "light"], expected: { theme: "light" }, hidden: true },
            { args: [{ theme: null }, "blue"], expected: { theme: "blue" }, hidden: true },
            {
              args: [{ theme: "dark", mode: "night" }, "light"],
              expected: { theme: "light", mode: "night" },
              hidden: true,
            },
            {
              args: [{ mode: "auto" }, "contrast"],
              expected: { mode: "auto", theme: "contrast" },
              hidden: true,
            },
            {
              args: [{ theme: 0 }, "high contrast"],
              expected: { theme: "high contrast" },
              hidden: true,
            },
          ],
        }}
        onResult={onResult}
      />
    ),
  },
  {
    typeLabel: "Coding challenge",
    title: "Own keys only",
    prompt: (
      <>
        Return <Code>true</Code> only for keys the object holds itself.
        Inherited keys such as <Code>toString</Code> must not count.
      </>
    ),
    ...codingMessages,
    renderAnswer: (onResult) => (
      <CodingChallenge
        starterCode={`function hasOwnKey(obj, key) {
  // code here
}`}
        challenge={{
          functionName: "hasOwnKey",
          testCases: [
            { args: [{ name: "Ada" }, "name"], expected: true },
            { args: [{ name: "Ada" }, "age"], expected: false },
            { args: [{ a: 1 }, "toString"], expected: false, hidden: true },
            { args: [{}, "x"], expected: false, hidden: true },
            { args: [{ a: 0 }, "a"], expected: true, hidden: true },
            { args: [{ hasOwnProperty: "nope" }, "hasOwnProperty"], expected: true, hidden: true },
            { args: [["x"], "length"], expected: true, hidden: true },
            { args: [["x"], "0"], expected: true, hidden: true },
            { args: [{ a: 1 }, "constructor"], expected: false, hidden: true },
            { args: [{ a: null }, "a"], expected: true, hidden: true },
          ],
        }}
        onResult={onResult}
      />
    ),
  },
  {
    typeLabel: "Select all that apply",
    title: "Shallow or deep?",
    prompt: (
      <>
        Remember that spread copies only the top level, while{" "}
        <Code>structuredClone</Code> copies everything.
      </>
    ),
    ...choiceMessages,
    pendingMessage: "Select your answers and check them to continue.",
    renderAnswer: (onResult) => (
      <MultipleChoiceQuestion
        question="Which statements change what user.tags contains?"
        code={`
const user = { name: "Ada", tags: ["js"] };
const copy = { ...user };
const clone = structuredClone(user);
`}
        choices={[
          <Code key="copy-push">{'copy.tags.push("web")'}</Code>,
          <Code key="clone-push">{'clone.tags.push("web")'}</Code>,
          <Code key="copy-assign">{'copy.tags = ["web"]'}</Code>,
          <Code key="user-pop">user.tags.pop()</Code>,
        ]}
        answer={[0, 3]}
        hint="At least one of your selections is wrong or missing. Ask of each statement whether it reaches the original tags array or only something else."
        explanation={
          <>
            <Code>copy</Code> is a shallow copy, so its <Code>tags</Code> is the
            same array as <Code>user.tags</Code>, and pushing through it changes
            both. Popping from <Code>user.tags</Code> changes it directly.{" "}
            <Code>clone</Code> is independent, and assigning a new array to{" "}
            <Code>copy.tags</Code> only changes the copy.
          </>
        }
        onResult={onResult}
      />
    ),
  },
  {
    typeLabel: "Coding challenge",
    title: "What is in stock?",
    prompt: (
      <>
        Return the names of the items with a count above 0, in their original
        order. <Code>Object.entries</Code> will help.
      </>
    ),
    ...codingMessages,
    renderAnswer: (onResult) => (
      <CodingChallenge
        starterCode={`function inStock(stock) {
  // code here
}`}
        challenge={{
          functionName: "inStock",
          testCases: [
            { args: [{ apples: 5, pears: 0, plums: 12 }], expected: ["apples", "plums"] },
            { args: [{ kiwi: 0 }], expected: [] },
            { args: [{ a: 1, b: 2 }], expected: ["a", "b"], hidden: true },
            { args: [{}], expected: [], hidden: true },
            { args: [{ x: 0, y: 3, z: 0 }], expected: ["y"], hidden: true },
            { args: [{ a: 1 }], expected: ["a"], hidden: true },
            { args: [{ a: 0, b: 1, c: 2 }], expected: ["b", "c"], hidden: true },
            { args: [{ apples: -1, pears: 1 }], expected: ["pears"], hidden: true },
            { args: [{ one: 0, two: 0 }], expected: [], hidden: true },
            { args: [{ large: 100, zero: 0 }], expected: ["large"], hidden: true },
          ],
        }}
        onResult={onResult}
      />
    ),
  },
  {
    typeLabel: "Coding challenge",
    title: "Titles in a unit",
    prompt: (
      <>
        Given an array of lesson objects, return the titles of the lessons whose{" "}
        <Code>unit</Code> matches the unit passed in.
      </>
    ),
    ...codingMessages,
    renderAnswer: (onResult) => (
      <CodingChallenge
        starterCode={`function titlesInUnit(lessons, unit) {
  // code here
}`}
        challenge={{
          functionName: "titlesInUnit",
          testCases: [
            {
              args: [
                [
                  { title: "Variables", unit: "JS Basics" },
                  { title: "Factory", unit: "Design Patterns" },
                  { title: "Arrays", unit: "JS Basics" },
                ],
                "JS Basics",
              ],
              expected: ["Variables", "Arrays"],
            },
            {
              args: [
                [
                  { title: "Variables", unit: "JS Basics" },
                  { title: "Factory", unit: "Design Patterns" },
                ],
                "Design Patterns",
              ],
              expected: ["Factory"],
            },
            { args: [[], "JS Basics"], expected: [], hidden: true },
            {
              args: [[{ title: "Variables", unit: "JS Basics" }], "jQuery"],
              expected: [],
              hidden: true,
            },
            {
              args: [[
                { title: "A", unit: "U" },
                { title: "B", unit: "V" },
                { title: "C", unit: "U" },
              ], "U"],
              expected: ["A", "C"],
              hidden: true,
            },
            {
              args: [[{ title: "One", unit: "U" }], "U"],
              expected: ["One"],
              hidden: true,
            },
            {
              args: [[{ title: "One", unit: "U" }], "V"],
              expected: [],
              hidden: true,
            },
            {
              args: [[
                { title: "A", unit: "V" },
                { title: "B", unit: "V" },
              ], "V"],
              expected: ["A", "B"],
              hidden: true,
            },
            {
              args: [[
                { title: "A", unit: "U" },
                { title: "B", unit: "U" },
              ], "U"],
              expected: ["A", "B"],
              hidden: true,
            },
            {
              args: [[
                { title: "same", unit: "U" },
                { title: "same", unit: "U" },
              ], "U"],
              expected: ["same", "same"],
              hidden: true,
            },
          ],
        }}
        onResult={onResult}
      />
    ),
  },
];

export function ObjectsQuiz({ lesson }: { lesson: Lesson }) {
  return (
    <LessonQuiz
      lesson={lesson}
      questions={questions}
      completionMessage={`You passed all ${questions.length} questions. Nice work putting objects into practice.`}
    />
  );
}
