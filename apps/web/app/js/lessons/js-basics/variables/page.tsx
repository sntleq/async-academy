// lessons/js-basics/variables/

import { ContentWithToc } from "@/components/layout/content-with-toc";
import {
  Code,
  CodeBlock,
  ComparisonTable,
  LessonTitle,
  List,
  P,
  Section,
  SubSection,
  Tip,
  Warning,
} from "@/components/lesson/lesson-ui";

export const metadata = { title: "Variables" };

// Array of objects: one entry per keyword. The table below is built from it with map().
const declarationKeywords = [
  {
    keyword: "var",
    scope: "Function",
    reassign: "Yes",
    redeclare: "Yes",
    hoisting: "Hoisted, starts as undefined",
  },
  {
    keyword: "let",
    scope: "Block",
    reassign: "Yes",
    redeclare: "No",
    hoisting: "Hoisted, unusable until declared",
  },
  {
    keyword: "const",
    scope: "Block",
    reassign: "No",
    redeclare: "No",
    hoisting: "Hoisted, unusable until declared",
  },
];

const dataTypes = [
  { type: "string", example: '"Ada"', typeofResult: '"string"' },
  { type: "number", example: "42 or 3.14", typeofResult: '"number"' },
  { type: "bigint", example: "123n", typeofResult: '"bigint"' },
  { type: "boolean", example: "true or false", typeofResult: '"boolean"' },
  { type: "undefined", example: "undefined", typeofResult: '"undefined"' },
  {
    type: "null",
    example: "null",
    typeofResult: '"object" (a historic quirk)',
  },
  { type: "symbol", example: 'Symbol("id")', typeofResult: '"symbol"' },
  {
    type: "object",
    example: '{ name: "Ada" } or [1, 2, 3]',
    typeofResult: '"object"',
  },
  {
    type: "function",
    example: "() => {}",
    typeofResult: '"function"',
  },
];

const namingRules = [
  "Names can contain letters, digits, underscores, and dollar signs.",
  "A name cannot start with a digit.",
  <>
    Names are case sensitive: <Code>age</Code> and <Code>Age</Code> are two
    different variables.
  </>,
  <>
    Reserved words such as <Code>class</Code>, <Code>return</Code>, and{" "}
    <Code>function</Code> cannot be used as names.
  </>,
  <>
    By convention, use <Code>camelCase</Code> for variables and{" "}
    <Code>UPPER_SNAKE_CASE</Code> for fixed constants.
  </>,
];

export default function Page() {
  return (
    <ContentWithToc>
      <LessonTitle>Variables</LessonTitle>
      <P>
        A variable is a named container for a value. Give it a name once, then
        use that name anywhere it is in scope instead of repeating the value.
      </P>

      <Section title="var, let, and const">
        <P>
          JavaScript has three keywords for declaring variables. They differ in
          scope, reassignment, and hoisting. Scope and hoisting get their own
          sections further down.
        </P>
        <ComparisonTable
          headers={["Keyword", "Scope", "Reassign", "Redeclare", "Hoisting"]}
          rows={declarationKeywords.map(
            ({ keyword, scope, reassign, redeclare, hoisting }) => [
              <Code key={keyword}>{keyword}</Code>,
              scope,
              reassign,
              redeclare,
              hoisting,
            ]
          )}
        />
        <CodeBlock
          title="Declaring with each keyword"
          code={`
const siteName = "Async Academy"; // cannot be reassigned
let visitors = 0;                 // can be reassigned
visitors = visitors + 1;

var legacy = "avoid in new code";

console.log(siteName);
console.log(visitors);
console.log(legacy);
`}
          output={`
Async Academy
1
avoid in new code
`}
        />
        <Tip>
          Start with <Code>const</Code>. Switch to <Code>let</Code> only when
          the value truly needs to change. Skip <Code>var</Code> in new code.
        </Tip>

        <SubSection title="Reassigning a const">
          <CodeBlock
            title="const blocks reassignment"
            code={`
const pi = 3.14;
pi = 3.14159; // TypeError: Assignment to constant variable.
`}
          />
          <Warning>
            <Code>const</Code> locks the variable, not the value inside it. A
            const object or array can still be changed. The Arrays and Objects
            lessons show this in action.
          </Warning>
        </SubSection>
      </Section>

      <Section title="Declaring and assigning">
        <P>
          Declaring creates the variable. Assigning gives it a value. Most of
          the time you do both in one line, but you can also split them.
        </P>
        <CodeBlock
          title="Declare now, assign later"
          code={`
let result;              // declared, no value yet
console.log(result);

result = 10;             // assigned later
console.log(result);

let width = 100, height = 50;   // several in one statement
console.log(width, height);     // one declaration per line is usually clearer

// const limit;          // SyntaxError: a const must be given a value
`}
          output={`
undefined
10
100 50
`}
        />
        <Warning>
          Assigning to a name that was never declared, like{" "}
          <Code>count = 5;</Code>, creates an accidental global variable in
          plain scripts and throws a ReferenceError in modules and strict mode.
          Always declare with <Code>const</Code> or <Code>let</Code>.
        </Warning>
        <Tip>
          Pulling several variables out of an array or object in a single line
          is called destructuring. You will meet it in the Arrays and Objects
          lessons.
        </Tip>
      </Section>

      <Section title="Naming rules">
        <List items={namingRules} />
        <CodeBlock
          title="Good and bad names"
          code={`
let userName = "Ada";      // good: camelCase
const MAX_RETRIES = 3;     // good: fixed constant
let $price = 9.99;         // valid
let _count = 0;            // valid

let age = 30;
let Age = 31;              // valid: names are case sensitive
console.log(age, Age);

// let 2fast = true;       // SyntaxError: starts with a digit
// let class = "math";     // SyntaxError: reserved word
`}
          output={`30 31`}
        />
      </Section>

      <Section title="Data types">
        <P>
          A variable can hold any type, and the same variable can hold a
          different type later. Use <Code>typeof</Code> to check which type a
          value has.
        </P>
        <ComparisonTable
          headers={["Type", "Example", "typeof result"]}
          rows={dataTypes.map(({ type, example, typeofResult }) => [
            <Code key={type}>{type}</Code>,
            example,
            typeofResult,
          ])}
        />
        <P>
          The first seven rows are primitives: single, simple values.{" "}
          <Code>object</Code> covers everything else, including arrays, and
          functions are objects too, although <Code>typeof</Code> reports them
          as <Code>&quot;function&quot;</Code>. Two of the primitives are easy
          to mix up: <Code>undefined</Code> means no value has been set yet,
          while <Code>null</Code> is an empty value you set on purpose.
        </P>
        <CodeBlock
          title="Checking types"
          code={`
let value = 42;
console.log(typeof value);  // "number"

value = "now a string";     // JavaScript is dynamically typed
console.log(typeof value);  // "string"

console.log(typeof null);   // "object" (a long-standing quirk)
`}
          output={`
number
string
object
`}
        />

        <SubSection title="Three ways to write a string">
          <P>
            Single and double quotes behave the same, so pick one and stay
            consistent. Backticks create a template literal, which can insert
            any expression with a dollar sign and curly braces and can span
            several lines.
          </P>
          <CodeBlock
            title="Quotes and template literals"
            code={`
const first = "Ada";
const last = 'Lovelace';
const full = \`\${first} \${last}\`; // template literal: backticks and \${...}

console.log(full);
console.log(\`2 + 3 = \${2 + 3}\`);   // any expression works inside \${...}
`}
            output={`
Ada Lovelace
2 + 3 = 5
`}
          />
        </SubSection>
      </Section>

      <Section title="Scope">
        <P>
          Scope decides where a variable can be used. <Code>let</Code> and{" "}
          <Code>const</Code> respect block scope, meaning the nearest pair of
          curly braces. <Code>var</Code> only respects function scope, so it
          leaks out of blocks.
        </P>
        <CodeBlock
          title="Block scope: let stays in, var leaks out"
          code={`
if (true) {
  let blockLet = "let stays inside the braces";
  var blockVar = "var leaks out of them";
}

console.log(blockVar);  // "var leaks out of them"
console.log(blockLet);  // ReferenceError: blockLet is not defined
`}
        />
        <CodeBlock
          title="Top-level and function scope"
          code={`
const appName = "Async Academy";            // top level: usable anywhere below it in this file

function greet() {
  const message = "Welcome to " + appName;  // function scope: exists only inside greet
  console.log(message);
}

greet();                // "Welcome to Async Academy"
console.log(message);   // ReferenceError: message is not defined
`}
        />
      </Section>

      <Section title="Hoisting and the temporal dead zone">
        <P>
          JavaScript registers declarations before running any code. A{" "}
          <Code>var</Code> starts as <Code>undefined</Code>. A <Code>let</Code>{" "}
          or <Code>const</Code> exists but cannot be touched until its
          declaration line runs. That gap is called the temporal dead zone.
          Function declarations are hoisted too, which the Functions lesson
          covers.
        </P>
        <CodeBlock
          title="Hoisting in action"
          code={`
console.log(a); // undefined
var a = 1;

console.log(b); // ReferenceError: Cannot access 'b' before initialization
let b = 2;
`}
        />
      </Section>
    </ContentWithToc>
  );
}
