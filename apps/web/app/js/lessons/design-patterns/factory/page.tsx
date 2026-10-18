// lessons/design-patterns/factory/

import { ContentWithToc } from "@/components/layout/content-with-toc";
import {
  Code,
  CodeBlock,
  ComparisonTable,
  LessonLink,
  LessonTitle,
  List,
  Note,
  P,
  Section,
  Tip,
  Warning,
} from "@/components/lesson/lesson-ui";

export const metadata = { title: "Factory Pattern" };

const factoryBenefits = [
  "One place defines the shape, so every object has the same properties.",
  "Defaults and validation live in one spot instead of at every call site.",
  "Callers do not need to know how an object is built, or which kind they get back.",
  <>
    No <Code>new</Code> and no <Code>this</Code> to get wrong.
  </>,
  "Private state is easy: variables inside the factory stay hidden.",
];

// Array of objects: the table below is built from it with map().
const creationStyles = [
  {
    approach: "Factory function",
    usesNew: "No",
    privateData: "Yes, with closures",
    instanceOf: "No",
    forgotNew: "Not applicable",
  },
  {
    approach: "Constructor function",
    usesNew: "Yes",
    privateData: "Possible, but clumsy",
    instanceOf: "Yes",
    forgotNew: "Fails quietly in plain scripts",
  },
  {
    approach: "Class",
    usesNew: "Yes",
    privateData: "Yes, with # fields",
    instanceOf: "Yes",
    forgotNew: "Throws a TypeError",
  },
];

export default function Page() {
  return (
    <ContentWithToc>
      <LessonTitle>Factory Pattern</LessonTitle>
      <P>
        A factory is a function whose job is to build and return objects.
        Callers say what they need, and the factory decides how to build it. You
        have already written two: <Code>createUser</Code> in the{" "}
        <LessonLink href="/js/lessons/js-basics/objects">Objects</LessonLink>{" "}
        lesson and <Code>createCounter</Code> in the{" "}
        <LessonLink href="/js/lessons/js-basics/functions">
          Functions
        </LessonLink>{" "}
        lesson. This lesson
        shows why the idea earns the name of a pattern.
      </P>

      <Section title="Why not build objects by hand?">
        <P>
          Writing the same object literal in many places works until one copy
          drifts from the others. JavaScript will not warn you, because a
          misspelled property is just a different property.
        </P>
        <CodeBlock
          title="Copies drift apart"
          code={`
const ada = { name: "Ada", role: "student", active: true };
const grace = { name: "Grace", role: "teacher", active: true };
const linus = { name: "Linus", rol: "student", active: true };  // typo goes unnoticed

console.log(linus.role);
`}
          output={`undefined`}
        />
        <P>
          A factory moves the shape of the object into one place. Every object
          it returns has the same properties.
        </P>
        <CodeBlock
          title="One function defines the shape"
          code={`
function createUser(name, role = "student") {
  return { name, role, active: true };
}

const ada = createUser("Ada");
const grace = createUser("Grace", "teacher");

console.log(ada);
console.log(grace);
`}
          output={`
{ name: "Ada", role: "student", active: true }
{ name: "Grace", role: "teacher", active: true }
`}
        />
        <P>What you get from this:</P>
        <List items={factoryBenefits} />
      </Section>

      <Section title="Defaults and validation">
        <P>
          Because every object passes through the factory, it is the right place
          to clean up input and reject bad values. A bad object never gets
          created.
        </P>
        <CodeBlock
          title="A factory that checks its input"
          code={`
function createUser(name, role = "student") {
  const allowedRoles = ["student", "teacher", "admin"];

  if (typeof name !== "string" || name.trim() === "") {
    throw new Error("A user needs a name");
  }
  if (!allowedRoles.includes(role)) {
    throw new Error("Unknown role: " + role);
  }

  return { name: name.trim(), role };
}

console.log(createUser("  Ada  "));   // spaces trimmed, default role applied
createUser("Grace", "wizard");        // throws, so no bad object exists
`}
          output={`
{ name: "Ada", role: "student" }
Error: Unknown role: wizard
`}
        />
      </Section>

      <Section title="Private state">
        <P>
          Variables inside a factory disappear when the call ends, unless a
          function created inside it still uses them. That is a closure, and it
          gives you data that outside code cannot touch.
        </P>
        <CodeBlock
          title="A balance nobody can edit directly"
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

console.log(account.getBalance());
console.log(account.balance);    // undefined: the variable is not a property
account.balance = 1000;          // creates an unrelated property
console.log(account.getBalance());
`}
          output={`
150
undefined
150
`}
        />
        <Tip>
          The <Code>balance</Code> parameter is an ordinary local variable. Only{" "}
          <Code>deposit</Code> and <Code>getBalance</Code>, which were created
          inside the factory, can reach it.
        </Tip>
      </Section>

      <Section title="Choosing what to build">
        <P>
          A factory can also decide which kind of object to return, so the
          caller only names what it wants. A lookup object keeps this tidy,
          instead of a long chain of <Code>if</Code> statements.
        </P>
        <CodeBlock
          title="One factory, several kinds"
          code={`
const shapeBuilders = {
  circle: (size) => ({
    type: "circle",
    area: () => Math.round(Math.PI * size * size),
  }),
  square: (size) => ({
    type: "square",
    area: () => size * size,
  }),
};

function createShape(type, size) {
  if (!Object.hasOwn(shapeBuilders, type)) {
    throw new Error("Unknown shape: " + type);
  }
  return shapeBuilders[type](size);
}

console.log(createShape("circle", 2).area());
console.log(createShape("square", 3).area());
createShape("triangle", 1);
`}
          output={`
13
9
Error: Unknown shape: triangle
`}
        />
        <Note>
          To support a new shape, add one entry to <Code>shapeBuilders</Code>.{" "}
          <Code>createShape</Code> and every caller stay the same.{" "}
          <Code>Object.hasOwn</Code> from the{" "}
          <LessonLink href="/js/lessons/js-basics/objects">Objects</LessonLink>{" "}
          lesson is the right check here, because a plain lookup would accept names every object
          inherits, such as <Code>toString</Code>.
        </Note>
      </Section>

      <Section title="Factories that return functions">
        <P>
          A factory does not have to build an object. It can build a function
          that remembers its settings, just like <Code>makeMultiplier</Code> in
          the <LessonLink href="/js/lessons/js-basics/functions">Functions</LessonLink>{" "}
          lesson.
        </P>
        <CodeBlock
          title="A logger factory"
          code={`
function createLogger(prefix) {
  return (message) => console.log("[" + prefix + "] " + message);
}

const info = createLogger("INFO");
const warn = createLogger("WARN");

info("Server started");
warn("Disk almost full");
`}
          output={`
[INFO] Server started
[WARN] Disk almost full
`}
        />
      </Section>

      <Section title="Factory, constructor, or class?">
        <P>
          JavaScript has three common ways to produce objects. They solve the
          same problem with different trade-offs.
        </P>
        <ComparisonTable
          headers={[
            "Approach",
            "Called with new?",
            "Private data",
            "instanceof works?",
            "If you forget new",
          ]}
          rows={creationStyles.map(
            ({ approach, usesNew, privateData, instanceOf, forgotNew }) => [
              approach,
              usesNew,
              privateData,
              instanceOf,
              forgotNew,
            ]
          )}
        />
        <CodeBlock
          title="The forgotten new"
          code={`
function Point(x, y) {
  this.x = x;
  this.y = y;
}

const broken = Point(1, 2);   // forgot new
console.log(broken);          // the function returned nothing
console.log(globalThis.x);    // this was the global object, so x leaked out
`}
          output={`
undefined
1
`}
        />
        <Warning>
          In strict mode, which modules and classes use, that call throws a
          TypeError instead of leaking a global. Either way it is a bug a
          factory function cannot have, because there is no <Code>new</Code> to
          forget.
        </Warning>
        <Note>
          A class stores its methods once and shares them between all objects.
          A factory creates fresh copies of its methods on every call. That only
          matters when you create many thousands of objects.
        </Note>
      </Section>

      <Section title="A factory on this site">
        <P>
          The sidebar is built from units and lessons created by factories, so
          nobody types a lesson link by hand. Here is a simplified version of
          the idea.
        </P>
        <CodeBlock
          title="Building lessons and units"
          code={`
function createLesson(unitSlug, slug, title) {
  return { title, slug, href: "/lessons/" + unitSlug + "/" + slug };
}

function createUnit(slug, title, lessons) {
  return {
    title,
    slug,
    items: lessons.map(([lessonSlug, lessonTitle]) =>
      createLesson(slug, lessonSlug, lessonTitle)
    ),
  };
}

const unit = createUnit("js-basics", "JavaScript Basics", [
  ["variables", "Variables"],
  ["arrays", "Arrays"],
]);

console.log(unit.items[1].href);
`}
          output={`/lessons/js-basics/arrays`}
        />
      </Section>

      <Section title="When to use one">
        <P>
          Reach for a factory when creating an object takes more than writing a
          literal: defaults, validation, private state, or a choice between
          several kinds. If an object literal does the job, use the literal. A
          factory that only returns <Code>{"{ a, b }"}</Code> adds a function
          without adding anything else.
        </P>
        <Note>
          Design pattern books describe several factory variations built around
          classes and inheritance. In JavaScript, functions are values, so a
          plain factory function covers most everyday cases.
        </Note>
      </Section>
    </ContentWithToc>
  );
}
