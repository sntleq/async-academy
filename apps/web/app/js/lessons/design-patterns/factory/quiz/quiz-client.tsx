// lessons/design-patterns/factory/quiz/

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
    title: "Editing from outside",
    prompt: (
      <>
        Work out which value the methods use, and what the assignment on the
        object actually creates.
      </>
    ),
    ...choiceMessages,
    renderAnswer: (onResult) => (
      <MultipleChoiceQuestion
        question="What does this code print?"
        code={`
function createAccount(owner, balance = 0) {
  return {
    owner,
    deposit(amount) {
      balance += amount;
      return balance;
    },
    getBalance() {
      return balance;
    },
  };
}

const account = createAccount("Ada", 100);
account.deposit(50);
account.balance = 1000;

console.log(account.getBalance());
console.log(account.balance);
`}
        choices={["150, then 1000", "1000, then 1000", "150, then undefined", "1000, then undefined"]}
        answer={0}
        feedback={{
          1: (
            <>
              The methods read a local variable, not a property. Does assigning{" "}
              <Code>account.balance</Code> change that variable?
            </>
          ),
          2: "Look at the assignment on the line before the logs. It did create something on the object.",
          3: "Check each line on its own. The first reads the private variable and the second reads a property.",
        }}
        explanation={
          <>
            <Code>getBalance</Code> reads the private <Code>balance</Code>{" "}
            variable, which is still 150. The assignment created a brand new,
            unrelated property on the object, so reading{" "}
            <Code>account.balance</Code> gives 1000.
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
        Give <Code>role</Code> a default of <Code>&quot;student&quot;</Code>,
        trim the name, and return an object with <Code>name</Code>,{" "}
        <Code>role</Code>, and an <Code>active</Code> property set to{" "}
        <Code>true</Code>.
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
            { args: ["Ada"], expected: { name: "Ada", role: "student", active: true } },
            {
              args: ["  Grace  ", "teacher"],
              expected: { name: "Grace", role: "teacher", active: true },
            },
            { args: ["Sam", "admin"], expected: { name: "Sam", role: "admin", active: true }, hidden: true },
            { args: ["  Max "], expected: { name: "Max", role: "student", active: true }, hidden: true },
          ],
        }}
        onResult={onResult}
      />
    ),
  },
  {
    typeLabel: "Coding challenge",
    title: "Choose what to build",
    prompt: (
      <>
        Look the shape up in <Code>shapeBuilders</Code>, build it, and return
        the text <Code>type: area</Code>, for example{" "}
        <Code>&quot;square: 9&quot;</Code>. For a name that is not one of its
        own keys, return <Code>&quot;unknown shape&quot;</Code>.
      </>
    ),
    ...codingMessages,
    renderAnswer: (onResult) => (
      <CodingChallenge
        starterCode={`const shapeBuilders = {
  circle: (size) => ({
    type: "circle",
    area: () => Math.round(Math.PI * size * size),
  }),
  square: (size) => ({
    type: "square",
    area: () => size * size,
  }),
};

function describeShape(type, size) {
  // code here
}`}
        challenge={{
          functionName: "describeShape",
          testCases: [
            { args: ["circle", 2], expected: "circle: 13" },
            { args: ["square", 3], expected: "square: 9" },
            { args: ["triangle", 1], expected: "unknown shape", hidden: true },
            { args: ["toString", 1], expected: "unknown shape", hidden: true },
            { args: ["square", 0], expected: "square: 0", hidden: true },
          ],
        }}
        onResult={onResult}
      />
    ),
  },
  {
    typeLabel: "Fix the bug",
    title: "One list for everyone",
    prompt: (
      <>
        Every list ends up with the same task. Read the code and fix it so each
        list gets its own <Code>items</Code> array.
      </>
    ),
    ...codingMessages,
    renderAnswer: (onResult) => (
      <CodingChallenge
        starterCode={`const sharedItems = [];

function createList(name) {
  return { name, items: sharedItems };
}

function makeLists(names) {
  const lists = names.map((name) => createList(name));
  lists[0].items.push("first task");

  return lists;
}`}
        challenge={{
          functionName: "makeLists",
          testCases: [
            {
              args: [["Home", "Work"]],
              expected: [
                { name: "Home", items: ["first task"] },
                { name: "Work", items: [] },
              ],
            },
            {
              args: [["A"]],
              expected: [{ name: "A", items: ["first task"] }],
            },
            {
              args: [["A", "B", "C"]],
              expected: [
                { name: "A", items: ["first task"] },
                { name: "B", items: [] },
                { name: "C", items: [] },
              ],
              hidden: true,
            },
          ],
        }}
        onResult={onResult}
      />
    ),
  },
  {
    typeLabel: "Select all that apply",
    title: "Factory or constructor?",
    prompt: <>Compare the factory function with a constructor called with new, using the table from the lesson.</>,
    ...choiceMessages,
    pendingMessage: "Select your answers and check them to continue.",
    renderAnswer: (onResult) => (
      <MultipleChoiceQuestion
        question="Which of these are true of a factory function compared with a constructor called with new?"
        choices={[
          "There is no new to forget",
          <>
            <Code>instanceof</Code> works on the objects it returns
          </>,
          "Variables inside it can stay private through closures",
          "Methods are stored once and shared by every object",
          "Defaults and validation can live in one place",
          "It has to be called with new",
        ]}
        answer={[0, 2, 4]}
        hint="At least one of your selections is wrong or missing. Check each statement against the comparison table in the lesson."
        explanation={
          <>
            A factory has no <Code>new</Code> to forget, keeps private state in
            closures, and puts defaults and validation in one place.{" "}
            <Code>instanceof</Code> and shared methods belong to classes and
            constructors instead.
          </>
        }
        onResult={onResult}
      />
    ),
  },
  {
    typeLabel: "Predict the output",
    title: "The forgotten new",
    prompt: (
      <>
        This time the blueprint is a class, not a constructor function. Think
        about what the lesson said happens without <Code>new</Code>.
      </>
    ),
    ...choiceMessages,
    renderAnswer: (onResult) => (
      <MultipleChoiceQuestion
        question="What happens when this code runs?"
        code={`
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

const p = Point(1, 2);
console.log(p);
`}
        choices={[
          <>
            It prints <Code>undefined</Code>
          </>,
          <>
            It throws a <Code>TypeError</Code>
          </>,
          <>
            It prints <Code>{"{ x: 1, y: 2 }"}</Code>
          </>,
          <>
            It prints <Code>{"{ x: undefined, y: undefined }"}</Code>
          </>,
        ]}
        answer={1}
        feedback={{
          0: "That is what a plain constructor function does when new is forgotten. A class behaves differently.",
          2: "Without new, no object is created for the constructor to fill in.",
          3: "Without new, no object is created for the constructor to fill in.",
        }}
        explanation={
          <>
            A class refuses to run without <Code>new</Code> and throws a{" "}
            <Code>TypeError</Code>. A factory function cannot have this bug,
            because there is no <Code>new</Code> to forget.
          </>
        }
        onResult={onResult}
      />
    ),
  },
  {
    typeLabel: "Coding challenge",
    title: "Write a factory with private state",
    prompt: (
      <>
        Finish <Code>createAccount</Code>. It should return an object with{" "}
        <Code>deposit(amount)</Code>, which adds to the balance and returns the
        new balance, and <Code>getBalance()</Code>. Keep the balance in a local
        variable. <Code>runAccount</Code> already uses your factory.
      </>
    ),
    ...codingMessages,
    renderAnswer: (onResult) => (
      <CodingChallenge
        starterCode={`function createAccount(balance) {
  // code here
}

function runAccount(startBalance, deposits) {
  const account = createAccount(startBalance);
  deposits.forEach((amount) => account.deposit(amount));

  return account.getBalance();
}`}
        challenge={{
          functionName: "runAccount",
          testCases: [
            { args: [100, [50, 25]], expected: 175 },
            { args: [0, []], expected: 0 },
            { args: [10, [5]], expected: 15, hidden: true },
            { args: [200, [1, 2, 3]], expected: 206, hidden: true },
          ],
        }}
        onResult={onResult}
      />
    ),
  },
];

export function FactoryQuiz({ lesson }: { lesson: Lesson }) {
  return (
    <LessonQuiz
      lesson={lesson}
      questions={questions}
      completionMessage={`You passed all ${questions.length} questions. Nice work putting the Factory pattern into practice.`}
    />
  );
}
