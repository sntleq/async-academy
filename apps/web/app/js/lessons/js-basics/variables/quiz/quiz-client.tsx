"use client";

import { CodingChallenge } from "@/components/lesson/coding-challenge";
import { Code } from "@/components/lesson/lesson-ui";
import { LessonQuiz, type LessonQuizQuestion } from "@/components/lesson/lesson-quiz";
import { MultipleChoiceQuestion } from "@/components/lesson/multiple-choice-question";
import type { Lesson } from "@/lib/lessons";

// Status lines under each item. "All checks passed" only makes sense for code,
// so each kind of item says what actually happened.
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
    title: "Spot the error",
    prompt: <>Read the code, then pick the line that throws a <Code>TypeError</Code>.</>,
    ...choiceMessages,
    renderAnswer: (onResult) => (
      <MultipleChoiceQuestion
        question="Which line throws an error?"
        code={`
const user = "Ada";
let score = 0;
score = score + 1;
user = "Grace";
`}
        choices={["Line 1", "Line 2", "Line 3", "Line 4"]}
        answer={3}
        feedback={{
          0: (
            <>
              Declaring a <Code>const</Code> is fine. Trouble starts when
              something tries to change it later.
            </>
          ),
          1: (
            <>
              A variable declared with <Code>let</Code> is allowed to change, so
              this line is fine.
            </>
          ),
          2: (
            <>
              <Code>score</Code> was declared with <Code>let</Code>, so it can
              be reassigned.
            </>
          ),
        }}
        explanation={
          <>
            <Code>user</Code> was declared with <Code>const</Code>, so
            reassigning it on line 4 throws a <Code>TypeError</Code>.
          </>
        }
        onResult={onResult}
      />
    ),
  },
  {
    typeLabel: "Coding challenge",
    title: "Total an order",
    prompt: (
      <>
        Multiply <Code>unitPrice</Code> by <Code>quantity</Code>, then add the
        flat shipping fee of 5 (already set in <Code>SHIPPING_FEE</Code>) to get
        the total.
      </>
    ),
    ...codingMessages,
    renderAnswer: (onResult) => (
      <CodingChallenge
        starterCode={`function calculateTotal(unitPrice, quantity) {
  const SHIPPING_FEE = 5;

  // code here

  return total;
}`}
        challenge={{
          functionName: "calculateTotal",
          returnVariable: { name: "total", keyword: "const" },
          testCases: [
            { args: [12, 3], expected: 41 },
            { args: [5, 4], expected: 25 },
            { args: [8, 7], expected: 61, hidden: true },
            { args: [15, 0], expected: 5, hidden: true },
            { args: [2, 4], expected: 13, hidden: true },
            { args: [0, 0], expected: 5, hidden: true },
            { args: [1, 1], expected: 6, hidden: true },
            { args: [7, 2], expected: 19, hidden: true },
            { args: [99, 1], expected: 104, hidden: true },
            { args: [0, 5], expected: 5, hidden: true },
          ],
        }}
        onResult={onResult}
      />
    ),
  },
  {
    typeLabel: "Fix the bug",
    title: "Fix the crash",
    prompt: <>This function crashes. Read the error, then fix it so it takes 10 off the price.</>,
    ...codingMessages,
    renderAnswer: (onResult) => (
      <CodingChallenge
        starterCode={`function applyDiscount(price) {
  const discounted = price;
  discounted = discounted - 10;

  return discounted;
}`}
        challenge={{
          functionName: "applyDiscount",
          testCases: [
            { args: [50], expected: 40 },
            { args: [100], expected: 90 },
            { args: [10], expected: 0, hidden: true },
            { args: [30], expected: 20, hidden: true },
            { args: [20], expected: 10, hidden: true },
            { args: [11], expected: 1, hidden: true },
            { args: [75], expected: 65, hidden: true },
            { args: [250], expected: 240, hidden: true },
            { args: [42], expected: 32, hidden: true },
            { args: [99], expected: 89, hidden: true },
          ],
        }}
        onResult={onResult}
      />
    ),
  },
  {
    typeLabel: "Predict the output",
    title: "Where does a variable live?",
    prompt: (
      <>
        Work out what happens before you run anything. Think about which
        variable each keyword creates, and where it can be seen.
      </>
    ),
    ...choiceMessages,
    renderAnswer: (onResult) => (
      <MultipleChoiceQuestion
        question="What happens when this code runs?"
        code={`
if (true) {
  var visible = "yes";
  let hidden = "no";
}

console.log(visible);
console.log(hidden);
`}
        choices={[
          <>
            It prints <Code>yes</Code>, then <Code>no</Code>
          </>,
          <>
            It prints <Code>yes</Code>, then throws a <Code>ReferenceError</Code>
          </>,
          <>
            It throws a <Code>ReferenceError</Code> before printing anything
          </>,
          <>
            It prints <Code>undefined</Code> twice
          </>,
        ]}
        answer={1}
        feedback={{
          0: "Look at where each variable is declared. One of them only exists inside the curly braces.",
          2: (
            <>
              An error happens when the failing line runs, not before. Does the
              first <Code>console.log</Code> have a problem?
            </>
          ),
          3: (
            <>
              <Code>undefined</Code> appears for a variable that exists but has
              no value yet. Both of these were given values inside the block.
            </>
          ),
        }}
        explanation={
          <>
            <Code>var</Code> ignores block scope, so <Code>visible</Code> still
            exists after the braces and prints <Code>yes</Code>. <Code>let</Code>{" "}
            stays inside the block, so reading <Code>hidden</Code> throws a
            ReferenceError.
          </>
        }
        onResult={onResult}
      />
    ),
  },
  {
    typeLabel: "Coding challenge",
    title: "Write a receipt line",
    prompt: (
      <>
        Build the receipt text with a template literal, using the{" "}
        <Code>total</Code> that is already calculated. Match the examples.
      </>
    ),
    ...codingMessages,
    renderAnswer: (onResult) => (
      <CodingChallenge
        starterCode={`function makeReceiptLine(item, unitPrice, quantity) {
  const total = unitPrice * quantity;

  // code here

  return line;
}`}
        challenge={{
          functionName: "makeReceiptLine",
          returnVariable: { name: "line", keyword: "const" },
          testCases: [
            { args: ["Pen", 4, 3], expected: "3 x Pen: $12" },
            { args: ["Book", 15, 2], expected: "2 x Book: $30" },
            { args: ["Mug", 8, 1], expected: "1 x Mug: $8", hidden: true },
            { args: ["Lamp", 20, 0], expected: "0 x Lamp: $0", hidden: true },
            { args: ["Sticker", 2, 5], expected: "5 x Sticker: $10", hidden: true },
            { args: ["Notebook", 3, 2], expected: "2 x Notebook: $6", hidden: true },
            { args: ["Tea", 0.5, 4], expected: "4 x Tea: $2", hidden: true },
            { args: ["Keychain", 7, 1], expected: "1 x Keychain: $7", hidden: true },
            { args: ["Coffee", 4, 0], expected: "0 x Coffee: $0", hidden: true },
            { args: ["A $ sign", 1, 3], expected: "3 x A $ sign: $3", hidden: true },
          ],
        }}
        onResult={onResult}
      />
    ),
  },
  {
    typeLabel: "Coding challenge",
    title: "Name the type",
    prompt: (
      <>
        Return the label and the type of <Code>value</Code>, matching the
        examples.
      </>
    ),
    ...codingMessages,
    renderAnswer: (onResult) => (
      <CodingChallenge
        starterCode={`function describeValue(label, value) {
  // code here

  return description;
}`}
        challenge={{
          functionName: "describeValue",
          returnVariable: { name: "description", keyword: "const" },
          testCases: [
            { args: ["age", 30], expected: "age: number" },
            { args: ["middleName", null], expected: "middleName: object" },
            { args: ["name", "Ada"], expected: "name: string", hidden: true },
            { args: ["active", true], expected: "active: boolean", hidden: true },
            { args: ["score", 0], expected: "score: number", hidden: true },
            { args: ["items", []], expected: "items: object", hidden: true },
            { args: ["user", { name: "Ada" }], expected: "user: object", hidden: true },
            { args: ["price", 19.99], expected: "price: number", hidden: true },
            { args: ["enabled", false], expected: "enabled: boolean", hidden: true },
            { args: ["empty", ""], expected: "empty: string", hidden: true },
          ],
        }}
        onResult={onResult}
      />
    ),
  },
  {
    typeLabel: "Select all that apply",
    title: "Valid names",
    prompt: <>Check each name against the naming rules from the lesson.</>,
    ...choiceMessages,
    pendingMessage: "Select your answers and check them to continue.",
    renderAnswer: (onResult) => (
      <MultipleChoiceQuestion
        question="Which of these are valid variable names?"
        choices={[
          <Code key="userName">userName</Code>,
          <Code key="2fast">2fast</Code>,
          <Code key="price">$price</Code>,
          <Code key="class">class</Code>,
          <Code key="count">_count</Code>,
          <Code key="first-name">first-name</Code>,
        ]}
        answer={[0, 2, 4]}
        hint="At least one of your selections is wrong or missing. Check each name for allowed characters, how it starts, and reserved words."
        explanation={
          <>
            Names can use letters, digits, underscores, and dollar signs, but
            cannot start with a digit, contain a hyphen, or be a reserved word
            like <Code>class</Code>.
          </>
        }
        onResult={onResult}
      />
    ),
  },
];

export function VariablesQuiz({ lesson }: { lesson: Lesson }) {
  return (
    <LessonQuiz
      lesson={lesson}
      questions={questions}
      completionMessage={`You passed all ${questions.length} questions. Nice work putting variables into practice.`}
    />
  );
}
