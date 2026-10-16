// lessons/js-basics/functions/

import { ContentWithToc } from "@/components/layout/content-with-toc";
import {
  Code,
  CodeBlock,
  ComparisonTable,
  LessonTitle,
  Note,
  P,
  Section,
  SubSection,
  Tip,
  Warning,
} from "@/components/lesson/lesson-ui";

export const metadata = { title: "Functions" };

// Array of objects: the table below is built from it with map().
const functionForms = [
  {
    form: "Declaration",
    hoisted: "Yes, the whole function",
    ownThis: "Yes",
    useFor: "Named, reusable helpers",
  },
  {
    form: "Expression",
    hoisted: "No",
    ownThis: "Yes",
    useFor: "Storing a function in a variable or passing it as a value",
  },
  {
    form: "Arrow",
    hoisted: "No",
    ownThis: "No, uses the surrounding this",
    useFor: "Short callbacks and array methods",
  },
  {
    form: "Method",
    hoisted: "No",
    ownThis: "Yes",
    useFor: "Functions that live inside objects and classes",
  },
  {
    form: "IIFE",
    hoisted: "No",
    ownThis: "Yes (an arrow IIFE: no)",
    useFor: "One-off setup with a private scope",
  },
];

export default function Page() {
  return (
    <ContentWithToc>
      <LessonTitle>Functions</LessonTitle>
      <P>
        A function is a reusable block of code. You define it once, then call it
        as many times as you like with different inputs.
      </P>

      <Section title="Ways to define a function">
        <ComparisonTable
          headers={["Form", "Hoisted?", "Has its own this?", "Typical use"]}
          rows={functionForms.map(({ form, hoisted, ownThis, useFor }) => [
            form,
            hoisted,
            ownThis,
            useFor,
          ])}
        />
        <P>
          Hoisting and <Code>this</Code> each get their own section below, so
          come back to the table once you have read them.
        </P>

        <SubSection title="Function declaration">
          <CodeBlock
            title="function name() {}"
            code={`
function add(a, b) {
  return a + b;
}

console.log(add(2, 3));
`}
            output={`5`}
          />
        </SubSection>

        <SubSection title="Function expression">
          <P>
            The function is a value stored in a variable. It can be anonymous or
            named. A name helps in error messages and lets the function call
            itself, but it is only visible inside the function.
          </P>
          <CodeBlock
            title="const name = function () {}"
            code={`
const multiply = function (a, b) {
  return a * b;
};
console.log(multiply(4, 5));

const factorial = function fact(n) {
  return n <= 1 ? 1 : n * fact(n - 1);   // the name lets it call itself
};
console.log(factorial(5));
console.log(typeof fact);                // the name does not exist outside
`}
            output={`
20
120
undefined
`}
          />
        </SubSection>

        <SubSection title="Arrow function">
          <CodeBlock
            title="const name = () => {}"
            code={`
const square = (n) => n * n;                  // one expression: returned automatically
const greet = (name) => {                     // braces: you must write return yourself
  return "Hi, " + name;
};
const makePoint = (x, y) => ({ x, y });       // wrap an object literal in parentheses

console.log(square(6));
console.log(greet("Ada"));
console.log(makePoint(1, 2));
`}
            output={`
36
Hi, Ada
{ x: 1, y: 2 }
`}
          />
        </SubSection>

        <SubSection title="Method">
          <P>
            A method is a function stored on an object. Inside it,{" "}
            <Code>this</Code> is the object the method was called on. The{" "}
            <Code>this</Code> section below explains why that matters.
          </P>
          <CodeBlock
            title="Functions inside objects"
            code={`
const counter = {
  count: 0,
  increment() {
    this.count++;
    return this.count;
  },
};

console.log(counter.increment());
console.log(counter.increment());
`}
            output={`
1
2
`}
          />
        </SubSection>

        <SubSection title="Immediately invoked function expression">
          <P>
            An IIFE is defined and called in the same step. Anything declared
            inside stays private to it.
          </P>
          <CodeBlock
            title="(function () {})()"
            code={`
(function () {
  const secret = 42;
  console.log("runs once", secret);
})();

(() => console.log("arrow version"))();

console.log(typeof secret);   // secret never leaked out
`}
            output={`
runs once 42
arrow version
undefined
`}
          />
        </SubSection>

        <Warning>
          <Code>
            new Function(&quot;a&quot;, &quot;b&quot;, &quot;return a +
            b&quot;)
          </Code>{" "}
          also creates a function, from a string. It behaves like{" "}
          <Code>eval</Code> and is slow and unsafe, so avoid it.
        </Warning>
      </Section>

      <Section title="Hoisting">
        <P>
          Declarations are hoisted completely, so you can call them before the
          line that defines them. Expressions and arrows follow the rules of the
          variable that holds them, so a <Code>const</Code> cannot be used
          before its line runs.
        </P>
        <CodeBlock
          title="Declaration versus expression"
          code={`
console.log(early());   // works: "declarations are hoisted"
function early() {
  return "declarations are hoisted";
}

console.log(late());    // ReferenceError: Cannot access 'late' before initialization
const late = () => "arrows are not";
`}
        />
      </Section>

      <Section title="Parameters and arguments">
        <P>
          Parameters are the names listed in the definition. Arguments are the
          values you pass in when you call the function.
        </P>
        <CodeBlock
          title="Default values"
          code={`
function greet(name = "friend", punctuation = "!") {
  return "Hello, " + name + punctuation;
}

console.log(greet());              // defaults used
console.log(greet("Ada", "?"));    // defaults replaced
`}
          output={`
Hello, friend!
Hello, Ada?
`}
        />
        <CodeBlock
          title="Rest parameters and spread"
          code={`
// Rest collects any number of extra arguments into an array
const sum = (...numbers) => numbers.reduce((total, n) => total + n, 0);
console.log(sum(1, 2, 3, 4));

// Spread does the reverse: it turns an array into separate arguments
const scores = [90, 75, 100];
console.log(Math.max(...scores));
`}
          output={`
10
100
`}
        />
        <CodeBlock
          title="Destructured parameters"
          code={`
// Pick properties out of an object argument, with a default
function describe({ name, role = "student" }) {
  return name + " is a " + role;
}

console.log(describe({ name: "Ada" }));
console.log(describe({ name: "Grace", role: "teacher" }));
`}
          output={`
Ada is a student
Grace is a teacher
`}
        />

        <SubSection title="Primitives are copied, objects are shared">
          <P>
            Primitives such as numbers and strings are copied into the function,
            so changing the parameter does not affect the original. Objects and
            arrays are shared: the function receives a reference to the same
            object, so changes to its properties are visible outside.
          </P>
          <CodeBlock
            title="Mutating an argument"
            code={`
function change(n, user) {
  n = 99;                  // changes the function's own copy
  user.name = "Grace";     // changes the shared object
}

let count = 1;
const person = { name: "Ada" };
change(count, person);

console.log(count);
console.log(person.name);
`}
            output={`
1
Grace
`}
          />
        </SubSection>
      </Section>

      <Section title="Return values">
        <P>
          A function returns <Code>undefined</Code> unless it uses{" "}
          <Code>return</Code>. Return stops the function immediately. To send
          back several values, return an array or an object.
        </P>
        <CodeBlock
          title="return stops the function"
          code={`
function sign(n) {
  if (n < 0) return "negative";   // the function ends here for negative numbers
  if (n === 0) return "zero";
  return "positive";
}

console.log(sign(-5));
console.log(sign(0));
console.log(sign(8));
`}
          output={`
negative
zero
positive
`}
        />
        <CodeBlock
          title="Returning several values, and returning nothing"
          code={`
function minMax(numbers) {
  return { min: Math.min(...numbers), max: Math.max(...numbers) };
}

const { min, max } = minMax([4, 8, 1, 9]);
console.log(min, max);

function noReturn() {}
console.log(noReturn());
`}
          output={`
1 9
undefined
`}
        />
      </Section>

      <Section title="Functions are values">
        <P>
          Functions can be stored in variables, passed to other functions, and
          returned from them. A function that takes or returns another function
          is called a higher-order function, and a function you pass in is
          called a callback. You already used callbacks with{" "}
          <Code>map</Code> and <Code>filter</Code> in the Arrays lesson.
        </P>
        <CodeBlock
          title="Callbacks and higher-order functions"
          code={`
const shout = (text) => text.toUpperCase() + "!";

function applyTwice(fn, value) {
  return fn(fn(value));
}

console.log(applyTwice(shout, "hey"));
`}
          output={`HEY!!`}
        />
        <CodeBlock
          title="An object of functions"
          code={`
const operations = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
};

const chosen = "subtract";
console.log(operations[chosen](10, 4));
`}
          output={`6`}
        />
        <Tip>
          Picking behavior from an object of functions at runtime is the idea
          behind the Strategy pattern, which you will meet in the Design
          Patterns unit.
        </Tip>
        <CodeBlock
          title="Returning a function"
          code={`
function makeMultiplier(factor) {
  return (n) => n * factor;
}

const double = makeMultiplier(2);
const triple = makeMultiplier(3);

console.log(double(5));
console.log(triple(5));
`}
          output={`
10
15
`}
        />
        <P>
          Notice that <Code>double</Code> still knows that{" "}
          <Code>factor</Code> is 2 long after <Code>makeMultiplier</Code> has
          finished. That memory is called a closure.
        </P>
      </Section>

      <Section title="Closures">
        <P>
          A function remembers the variables from the place where it was
          created, even after that place has finished running. This is how you
          create private state.
        </P>
        <CodeBlock
          title="A counter with private state"
          code={`
function createCounter(start = 0) {
  let count = start; // private: only reachable through the returned functions

  return {
    increment: () => ++count,
    reset: () => (count = start),
    value: () => count,
  };
}

const clicks = createCounter();
clicks.increment();
clicks.increment();
console.log(clicks.increment());

const other = createCounter(100);
console.log(other.value());    // its own separate count
console.log(clicks.value());   // unaffected by other
console.log(clicks.count);     // count is hidden, not a property
`}
          output={`
3
100
3
undefined
`}
        />
        <Tip>
          <Code>createCounter</Code> is a factory function: every call builds a
          fresh object with its own private <Code>count</Code>.
        </Tip>

        <SubSection title="A classic trap: closures in loops">
          <P>
            A <Code>var</Code> loop has one shared variable, so every function
            created in it sees its final value. A <Code>let</Code> loop gets a
            fresh variable on each pass.
          </P>
          <CodeBlock
            title="var versus let in a loop"
            code={`
const withVar = [];
for (var i = 0; i < 3; i++) {
  withVar.push(() => i);
}
console.log(withVar.map((fn) => fn()));

const withLet = [];
for (let j = 0; j < 3; j++) {
  withLet.push(() => j);
}
console.log(withLet.map((fn) => fn()));
`}
            output={`
[3, 3, 3]
[0, 1, 2]
`}
          />
        </SubSection>
      </Section>

      <Section title="Arrow functions and this">
        <P>
          A regular function decides its own <Code>this</Code> based on how it
          is called. An arrow function has no <Code>this</Code> of its own and
          uses the one from the code around it. In the example below,{" "}
          <Code>setTimeout</Code> runs the function you give it later, after the
          current code has finished.
        </P>
        <CodeBlock
          title="this inside a callback"
          code={`
const timer = {
  seconds: 30,
  startRegular() {
    setTimeout(function () {
      console.log(this.seconds); // this is not timer
    }, 0);
  },
  startArrow() {
    setTimeout(() => {
      console.log(this.seconds); // this is timer
    }, 0);
  },
};

timer.startRegular();
timer.startArrow();
`}
          output={`
undefined
30
`}
        />
        <Note>
          Because of this, use a regular method for functions that belong to an
          object and an arrow function for short callbacks inside them. Do not
          write the object&apos;s own methods as arrow functions, because{" "}
          <Code>this</Code> would not be the object.
        </Note>
      </Section>

      <Section title="Recursion">
        <P>
          A function can call itself. Every recursive function needs a base case
          that stops the calls, or it will run until the call stack overflows.
        </P>
        <CodeBlock
          title="Counting down recursively"
          code={`
function countdown(n) {
  if (n === 0) {      // base case
    console.log("Liftoff");
    return;
  }
  console.log(n);
  countdown(n - 1);   // recursive case
}

countdown(3);
`}
          output={`
3
2
1
Liftoff
`}
        />
        <P>
          A countdown is easier with a loop. Recursion earns its place when the
          data is nested to an unknown depth.
        </P>
        <CodeBlock
          title="Summing a nested array"
          code={`
function sumAll(items) {
  let total = 0;
  for (const item of items) {
    total += Array.isArray(item) ? sumAll(item) : item;   // an array inside: recurse
  }
  return total;
}

console.log(sumAll([1, [2, [3, 4]], 5]));
`}
          output={`15`}
        />
      </Section>
    </ContentWithToc>
  );
}