// lessons/design-patterns/module/

import { ContentWithToc } from "@/components/layout/content-with-toc";
import Link from "next/link";
import { buttonVariants } from "@workspace/ui/components/button";
import {
  Code,
  CodeBlock,
  LessonLink,
  LessonTitle,
  List,
  Note,
  P,
  Section,
  Tip,
  Warning,
} from "@/components/lesson/lesson-ui";

export const metadata = { title: "Module Pattern" };

const moduleDownsides = [
  "Private functions cannot be tested directly, because nothing outside can reach them.",
  "Modules that depend on each other must be loaded in the right order by hand.",
  "Every module wraps itself in its own function, which is easy to get wrong.",
];

export default function Page() {
  return (
    <ContentWithToc>
      <LessonTitle>Module Pattern</LessonTitle>
      <P>
        The Module pattern groups related code behind a small public interface
        and keeps everything else private. It is built from two things you
        already know: an immediately invoked function expression and a closure.
        Modern JavaScript has modules built in, but the pattern is still worth
        learning, because it explains how they work and you will meet it in
        older code.
      </P>

      <Section title="The problem: everything is shared">
        <P>
          Code at the top level of a plain script is visible to every other
          script on the page. Nothing stops other code from reaching in and
          changing a value your code depends on.
        </P>
        <CodeBlock
          title="Anyone can change count"
          code={`
let count = 0;

function increment() {
  count++;
}

increment();
count = 999;        // nothing stops other code from doing this
increment();
console.log(count);
`}
          output={`1000`}
        />
      </Section>

      <Section title="An IIFE that returns an interface">
        <P>
          Wrap the code in an IIFE, so its variables live in a function scope,
          and return an object containing only the parts that outside code may
          use. Everything not returned stays private.
        </P>
        <CodeBlock
          title="A counter module"
          code={`
const counter = (function () {
  let count = 0;                      // private

  function log(message) {             // private helper
    console.log("[counter] " + message);
  }

  return {
    increment() {
      count++;
      log("now " + count);
      return count;
    },
    value() {
      return count;
    },
  };
})();

counter.increment();
counter.increment();
console.log(counter.value());
console.log(counter.count);           // undefined: private
`}
          output={`
[counter] now 1
[counter] now 2
2
undefined
`}
        />
        <P>
          The IIFE runs once, so only one counter exists. A module built this way
          is also a singleton, like the one in the{" "}
          <LessonLink href="/js/lessons/design-patterns/singleton">
            Singleton
          </LessonLink>{" "}
          lesson.
        </P>
      </Section>

      <Section title="The revealing module pattern">
        <P>
          A popular variation defines everything as plain private functions
          first, then returns an object that reveals the chosen ones at the
          bottom. The returned object works as a table of contents for the
          module.
        </P>
        <CodeBlock
          title="Reveal only what you choose"
          code={`
const cart = (function () {
  const items = [];

  function add(name, price) {
    items.push({ name, price });
  }

  function total() {
    return items.reduce((sum, { price }) => sum + price, 0);
  }

  function count() {
    return items.length;
  }

  return { add, total, count };   // reveal only these three
})();

cart.add("Book", 12);
cart.add("Pen", 3);
console.log(cart.count());
console.log(cart.total());
console.log(cart.items);          // undefined: items stayed private

const { add } = cart;             // pulling a function out is safe: no this involved
add("Lamp", 20);
console.log(cart.total());
`}
          output={`
2
15
undefined
35
`}
        />
        <Tip>
          Functions inside the module call each other by plain name, not through{" "}
          <Code>this</Code>. That is why <Code>add</Code> still works after
          being pulled out of the object, which the{" "}
          <LessonLink href="/js/lessons/js-basics/functions">Functions</LessonLink>{" "}
          lesson showed is not true for methods that rely on <Code>this</Code>.
        </Tip>
      </Section>

      <Section title="Passing things in">
        <P>
          An IIFE can take parameters, which lets several modules attach
          themselves to one shared object. This is called a namespace, and it
          keeps your code to a single name instead of many loose globals.
        </P>
        <CodeBlock
          title="Modules extending a shared namespace"
          code={`
const App = {};

(function (app) {
  let visits = 0;
  app.visit = () => ++visits;
  app.visits = () => visits;
})(App);

(function (app) {
  app.report = () => "Total visits: " + app.visits();
})(App);

App.visit();
App.visit();
console.log(App.report());
`}
          output={`Total visits: 2`}
        />
        <Note>
          Older libraries use this same shape to avoid leaking globals. A jQuery
          plugin starts with <Code>{"(function ($) { ... })(jQuery)"}</Code>,
          which you will see in the jQuery unit.
        </Note>
      </Section>

      <Section title="Modern modules">
        <P>
          Today every file can be a module. Each file has its own scope, so
          nothing is shared unless you <Code>export</Code> it, and other files
          bring it in with <Code>import</Code>. The export list plays the role
          of the object the IIFE used to return.
        </P>
        <CodeBlock
          title="counter.js and app.js"
          files={{
            "counter.js": `
let count = 0;                         // private: not exported

export function increment() {
  return ++count;
}

export function value() {
  return count;
}
`,
            "app.js": `
import { increment, value } from "./counter.js";

increment();
console.log(value());                  // 1
`,
          }}
          entry="app.js"
          output={`1`}
        />
        <P>
          The Modularization unit later in this course covers CommonJS and AMD,
          two other module systems that grew out of the same idea.
        </P>
      </Section>

      <Section title="The downsides">
        <P>The IIFE version of the pattern has real limits:</P>
        <List items={moduleDownsides} />
        <Warning>
          Prefer built-in modules in new code. Use the IIFE version when you
          need private scope in a single script, or when you read code that was
          written before modules existed.
        </Warning>
      </Section>

      <Section title="A module on this site">
        <P>
          The Web Worker that runs the code blocks on this site is a module
          written this way. Its source is one IIFE. The helpers that format
          console output live inside it, and only the <Code>run</Code> and
          <Code>runModule</Code> functions are exposed to the rest of the worker.
        </P>
      </Section>

      <section className="mt-24 border-t pt-10">
        <h2
          id="ready-for-the-quiz"
          data-toc-space="true"
          data-toc-active-at-bottom="true"
          className="mb-4 scroll-mt-24 font-heading text-3xl leading-tight tracking-tight sm:text-4xl"
        >
          Ready for the quiz?
        </h2>
        <P>
          Put this lesson into practice with a short quiz of coding exercises and
          quick knowledge checks. The lesson is only marked as done once you
          complete the quiz.
        </P>
        <Link
          href="/js/lessons/design-patterns/module/quiz"
          className={buttonVariants({ size: "lg" })}
        >
          Start the quiz
        </Link>
      </section>
    </ContentWithToc>
  );
}
