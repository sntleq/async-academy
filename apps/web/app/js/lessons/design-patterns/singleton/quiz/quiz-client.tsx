// lessons/design-patterns/singleton/quiz/

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
    title: "Two blueprints, two objects",
    prompt: (
      <>
        Think about what <Code>new</Code> gives you each time it runs.
      </>
    ),
    ...choiceMessages,
    renderAnswer: (onResult) => (
      <MultipleChoiceQuestion
        question="What does this code print?"
        code={`
class Settings {
  constructor() {
    this.theme = "light";
  }
}

const a = new Settings();
const b = new Settings();

a.theme = "dark";
console.log(b.theme);
console.log(a === b);
`}
        choices={["light, then false", "dark, then true", "dark, then false", "light, then true"]}
        answer={0}
        feedback={{
          1: (
            <>
              Each <Code>new</Code> builds a separate object. Would a change to
              one show up in the other?
            </>
          ),
          2: (
            <>
              <Code>b</Code> is a separate object, so the change to{" "}
              <Code>a</Code> never reaches it.
            </>
          ),
          3: (
            <>
              <Code>===</Code> asks whether both names point at the same object.
              Does <Code>new</Code> ever reuse one?
            </>
          ),
        }}
        explanation={
          <>
            Every <Code>new Settings()</Code> creates a separate object, so{" "}
            <Code>b</Code> keeps its own <Code>&quot;light&quot;</Code> theme and
            the two are not equal. A singleton exists to prevent exactly this.
          </>
        }
        onResult={onResult}
      />
    ),
  },
  {
    typeLabel: "Coding challenge",
    title: "Create it lazily",
    prompt: (
      <>
        Finish <Code>getDatabase</Code>. Create the database only on the first
        request by calling the supplied <Code>createDatabase</Code> factory.
        It increments <Code>opened</Code> and gives each new database a unique
        id. Return the ids from all requests, the final <Code>opened</Code>
        count, and whether every request got the same object. With no requests,
        nothing should be created.
      </>
    ),
    ...codingMessages,
    renderAnswer: (onResult) => (
      <CodingChallenge
        starterCode={`function countOpened(requests) {
  let database = null;
  let opened = 0;

  function createDatabase() {
    opened += 1;
    return { id: opened };
  }

  function getDatabase() {
    // code here
  }

  const databaseIds = [];
  let firstDatabase = null;
  let sameObject = true;
  for (let i = 0; i < requests; i++) {
    const current = getDatabase();
    if (i === 0) firstDatabase = current;
    else sameObject = sameObject && current === firstDatabase;
    databaseIds.push(current.id);
  }

  return { opened, databaseIds, sameObject };
}`}
        challenge={{
          functionName: "countOpened",
          testCases: [
            {
              args: [1],
              expected: { opened: 1, databaseIds: [1], sameObject: true },
            },
            {
              args: [3],
              expected: { opened: 1, databaseIds: [1, 1, 1], sameObject: true },
            },
            {
              args: [0],
              expected: { opened: 0, databaseIds: [], sameObject: true },
              hidden: true,
            },
            {
              args: [5],
              expected: { opened: 1, databaseIds: [1, 1, 1, 1, 1], sameObject: true },
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
    title: "A constructor that returns",
    prompt: (
      <>
        A constructor that returns an object replaces the one that{" "}
        <Code>new</Code> was about to hand back. Follow what each call returns.
      </>
    ),
    ...choiceMessages,
    renderAnswer: (onResult) => (
      <MultipleChoiceQuestion
        question="What does this code print?"
        code={`
class Settings {
  static #instance;

  constructor() {
    if (Settings.#instance) return Settings.#instance;

    this.theme = "light";
    Settings.#instance = this;
  }
}

const a = new Settings();
a.theme = "dark";
const b = new Settings();

console.log(b.theme);
console.log(a === b);
`}
        choices={["light, then false", "dark, then true", "light, then true", "dark, then false"]}
        answer={1}
        feedback={{
          0: (
            <>
              The second <Code>new</Code> finds an instance already stored and
              returns it. It does not start from scratch.
            </>
          ),
          2: (
            <>
              <Code>b</Code> is the stored object, which was changed to dark
              before <Code>b</Code> was created.
            </>
          ),
          3: (
            <>
              The constructor hands back the stored object, so both names point
              at it.
            </>
          ),
        }}
        explanation={
          <>
            The second <Code>new Settings()</Code> returns the stored instance
            instead of building a new one. So <Code>b</Code> is the same object
            as <Code>a</Code>, already switched to dark, and the two are equal.
          </>
        }
        onResult={onResult}
      />
    ),
  },
  {
    typeLabel: "Fix the bug",
    title: "Only one, please",
    prompt: (
      <>
        Fix <Code>getInstance</Code> so it returns the same settings object on
        every request and constructs it only once. Return the construction
        count, the ids returned for each request, and whether they are all the
        same object. With no requests, nothing should be constructed.
      </>
    ),
    ...codingMessages,
    renderAnswer: (onResult) => (
      <CodingChallenge
        starterCode={`function countCreated(requests) {
  class Settings {
    static #instance = null;
    static created = 0;

    constructor() {
      Settings.created++;
      this.id = Settings.created;
    }

    static getInstance() {
      Settings.#instance = new Settings();

      return Settings.#instance;
    }
  }

  const instances = [];
  for (let i = 0; i < requests; i++) {
    instances.push(Settings.getInstance());
  }

  const firstInstance = instances[0] ?? null;
  return {
    created: Settings.created,
    instanceIds: instances.map((instance) => instance.id),
    sameInstance: instances.every((instance) => instance === firstInstance),
  };
}`}
        challenge={{
          functionName: "countCreated",
          testCases: [
            {
              args: [3],
              expected: { created: 1, instanceIds: [1, 1, 1], sameInstance: true },
            },
            {
              args: [1],
              expected: { created: 1, instanceIds: [1], sameInstance: true },
            },
            {
              args: [0],
              expected: { created: 0, instanceIds: [], sameInstance: true },
              hidden: true,
            },
            {
              args: [10],
              expected: {
                created: 1,
                instanceIds: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                sameInstance: true,
              },
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
    title: "The downsides",
    prompt: <>Recall the list of downsides from the lesson, and what each one means in practice.</>,
    ...choiceMessages,
    pendingMessage: "Select your answers and check them to continue.",
    renderAnswer: (onResult) => (
      <MultipleChoiceQuestion
        question="Which of these are downsides of a singleton?"
        choices={[
          "A function that uses it hides that dependency from its parameters",
          "State can leak from one test into the next",
          "It is easy to swap for a fake in tests",
          "Any part of the program can change it, which makes bugs harder to trace",
          "It can only be built with a class",
          "It cannot be created lazily",
        ]}
        answer={[0, 1, 3]}
        hint="At least one of your selections is wrong or missing. Ask of each statement whether it is a real downside, or something the lesson showed is possible."
        explanation={
          <>
            A singleton hides a dependency, shares state between tests, and lets
            any code change it. It is hard to swap for a fake, not easy. It can
            be built with a plain object or a module, and it can be created
            lazily.
          </>
        }
        onResult={onResult}
      />
    ),
  },
  {
    typeLabel: "Coding challenge",
    title: "Modules run once",
    prompt: (
      <>
        Complete <Code>runApp</Code> in <Code>app.js</Code>. For the requested
        database, return its name, whether both imports refer to the same
        object, and the connection count. The other files are fixed context;
        <Code>app.js</Code> is the file the tests run.
      </>
    ),
    ...codingMessages,
    renderAnswer: (onResult) => (
      <CodingChallenge
        files={{
          "db.js": [
            'console.log("Connecting...");',
            "let connectionCount = 0;",
            "connectionCount += 1;",
            'export const db = { name: "main" };',
            "export { connectionCount };",
          ].join("\n"),
          "users.js": [
            'import { db } from "./db.js";',
            "export const usersDb = db;",
          ].join("\n"),
          "orders.js": [
            'import { db } from "./db.js";',
            "export const ordersDb = db;",
          ].join("\n"),
          "app.js": [
            'import { usersDb } from "./users.js";',
            'import { ordersDb } from "./orders.js";',
            'import { connectionCount } from "./db.js";',
            "",
            "function runApp(which) {",
            "  // code here",
            "}",
          ].join("\n"),
        }}
        entry="app.js"
        challenge={{
          functionName: "runApp",
          testCases: [
            {
              args: ["users"],
              expected: { name: "main", sameDatabase: true, connectionCount: 1 },
            },
            {
              args: ["orders"],
              expected: { name: "main", sameDatabase: true, connectionCount: 1 },
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
    title: "Pass it in",
    prompt: (
      <>
        The top-level <Code>sharedCart</Code> is the global dependency you are
        removing. Change <Code>addItem</Code> to accept a cart as its first
        parameter, add the item to that passed-in cart, and return its new item
        count. Do not read or reassign <Code>sharedCart</Code>.
      </>
    ),
    ...codingMessages,
    renderAnswer: (onResult) => (
      <CodingChallenge
        starterCode={`const sharedCart = { items: [] };

function addItem(item) {
  sharedCart.items.push(item);

  return sharedCart.items.length;
}`}
        challenge={{
          functionName: "addItem",
          testCases: [
            { args: [{ items: [] }, "book"], expected: 1 },
            { args: [{ items: ["pen", "ink"] }, "book"], expected: 3 },
            { args: [{ items: ["a"] }, "b"], expected: 2, hidden: true },
            { args: [{ items: [] }, "x"], expected: 1, hidden: true },
          ],
        }}
        onResult={onResult}
      />
    ),
  },
];

export function SingletonQuiz({ lesson }: { lesson: Lesson }) {
  return (
    <LessonQuiz
      lesson={lesson}
      questions={questions}
      completionMessage={`You passed all ${questions.length} questions. Nice work putting the Singleton pattern into practice.`}
    />
  );
}
