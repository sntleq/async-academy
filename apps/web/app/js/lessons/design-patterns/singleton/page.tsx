// lessons/design-patterns/singleton/

import { ContentWithToc } from "@/components/layout/content-with-toc";
import {
  Code,
  CodeBlock,
  LessonLink,
  LessonTitle,
  List,
  Note,
  P,
  Section,
  SubSection,
  Tip,
  Warning,
} from "@/components/lesson/lesson-ui";

export const metadata = { title: "Singleton Pattern" };

const singletonDownsides = [
  "It is a hidden dependency: a function that reaches for the singleton does not say so in its parameters.",
  "Shared state leaks between tests, so one test can break another.",
  "It is hard to swap for a fake, such as a test database.",
  "Any part of the program can change it, which makes bugs harder to trace.",
];

export default function Page() {
  return (
    <ContentWithToc>
      <LessonTitle>Singleton Pattern</LessonTitle>
      <P>
        A singleton is an object of which only one exists. Every part of the
        program that asks for it gets the same one. Typical examples are app
        settings, a database connection, a logger, and a cache.
      </P>

      <Section title="Why only one?">
        <P>
          Normally, creating two objects from the same blueprint gives you two
          separate objects. For something that should be shared, that is a
          problem: a change made through one is invisible to the other.
        </P>
        <CodeBlock
          title="Two settings objects drift apart"
          code={`
class Settings {
  constructor() {
    this.theme = "light";
  }
}

const a = new Settings();
const b = new Settings();

a.theme = "dark";
console.log(b.theme);    // b never heard about the change
console.log(a === b);
`}
          output={`
light
false
`}
        />
        <P>
          For settings you want one object that the whole program reads and
          writes. That is what a singleton guarantees.
        </P>
      </Section>

      <Section title="The simplest singleton: an object literal">
        <P>
          An object literal creates exactly one object, so there is only one
          thing to share. In JavaScript this is often all you need.
        </P>
        <CodeBlock
          title="One shared object"
          code={`
const settings = { theme: "light" };

function useDarkMode() {
  settings.theme = "dark";
}

function currentTheme() {
  return settings.theme;
}

useDarkMode();
console.log(currentTheme());
`}
          output={`dark`}
        />
      </Section>

      <Section title="A class with getInstance">
        <P>
          When the object comes from a class, you control creation by keeping
          the one instance inside the class and handing it out through a method.
          Two pieces of syntax make this work. A <Code>static</Code> member
          belongs to the class itself, not to its instances. A name starting
          with <Code>#</Code> is private: only code inside the class body can
          touch it.
        </P>
        <CodeBlock
          title="Static instance and getInstance"
          code={`
class Settings {
  static #instance = null;

  constructor() {
    this.theme = "light";
  }

  static getInstance() {
    if (Settings.#instance === null) {
      Settings.#instance = new Settings();   // created once, on first request
    }
    return Settings.#instance;
  }
}

const a = Settings.getInstance();
const b = Settings.getInstance();

a.theme = "dark";
console.log(b.theme);
console.log(a === b);
`}
          output={`
dark
true
`}
        />

        <SubSection title="Making new return the same object">
          <P>
            Nothing above stops someone from writing <Code>new Settings()</Code>{" "}
            anyway. One way to close that gap is to let the constructor hand
            back the existing object. A constructor that returns an object
            replaces the new one.
          </P>
          <CodeBlock
            title="A constructor that returns the existing instance"
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
const b = new Settings();
console.log(a === b);
`}
            output={`true`}
          />
          <Note>
            TypeScript has a cleaner option: mark the constructor{" "}
            <Code>private</Code>, and <Code>new Settings()</Code> becomes a
            compile error. The <Code>Curriculum</Code> class on this site does
            exactly that.
          </Note>
        </SubSection>
      </Section>

      <Section title="Creating it lazily">
        <P>
          A singleton does not need to exist from the start. Creating it on
          first use means expensive setup, such as opening a database
          connection, never happens if nothing asks for it, and happens only
          once if many things do.
        </P>
        <CodeBlock
          title="Connect on first use"
          code={`
let database = null;

function connect() {
  console.log("Connecting...");
  return { name: "main" };
}

function getDatabase() {
  if (database === null) {
    database = connect();   // only the first call gets here
  }
  return database;
}

const first = getDatabase();
const second = getDatabase();
console.log(first === second);
`}
          output={`
Connecting...
true
`}
        />
        <Tip>
          <Code>{"database ??= connect();"}</Code> does the same check and
          assignment in one line.
        </Tip>
      </Section>

      <Section title="Singletons and modules">
        <P>
          In a real project, you rarely need a class for this. A module file
          runs once, the first time anything imports it. Every later import gets
          the same exports, so an object created at the top of a module is
          already a singleton.
        </P>
        <CodeBlock
          title="db.js, users.js, and orders.js"
          files={{
            "db.js": `
function createDatabase() {
  console.log("Connecting...");
  return { name: "main" };
}

export const db = createDatabase();   // runs once, on the first import
`,
            "users.js": `
import { db } from "./db.js";         // the shared object

export const usersDb = db;
`,
            "orders.js": `
import { db } from "./db.js";         // the same shared object again

export const ordersDb = db;
`,
            "app.js": `
import { usersDb } from "./users.js";
import { ordersDb } from "./orders.js";

console.log(usersDb === ordersDb);
`,
          }}
          entry="app.js"
          output={`
Connecting...
true
`}
        />
        <Note>
          Tools with hot reload, such as Next.js in development, run module
          files again after every edit. A module-level singleton can then be
          created more than once, so real projects store it on{" "}
          <Code>globalThis</Code>, which survives reloads.
        </Note>
      </Section>

      <Section title="The downsides">
        <P>
          A singleton is global state with a polite name. Use it sparingly.
        </P>
        <List items={singletonDownsides} />
        <CodeBlock
          title="State left over from earlier code"
          code={`
const cart = { items: [] };

function addItem(item) {
  cart.items.push(item);
}

// First test
addItem("book");
console.log(cart.items.length);

// Second test: it expects an empty cart, but the shared one still holds the book
console.log(cart.items.length);
`}
          output={`
1
1
`}
        />
        <Warning>
          Use a singleton only for things that are unique by nature: a
          connection pool, configuration, a cache. If a function can receive the
          object as a parameter instead, prefer that. For an example, see the{" "}
          <LessonLink href="/js/lessons/design-patterns/strategy">
            Strategy
          </LessonLink>{" "}
          lesson.
        </Warning>
      </Section>

      <Section title="A singleton on this site">
        <P>
          The sidebar and the previous and next lesson buttons both need the
          list of lessons. The <Code>Curriculum</Code> class builds the flat
          lesson list once and gives everyone the same instance through{" "}
          <Code>Curriculum.getInstance()</Code>. It is the static-instance
          version from earlier in this lesson.
        </P>
      </Section>
    </ContentWithToc>
  );
}
