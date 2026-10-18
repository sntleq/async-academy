// lessons/design-patterns/strategy/

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

export const metadata = { title: "Strategy Pattern" };

// Array of objects: the table below is built from it with map().
const strategyRoles = [
  {
    role: "Strategy",
    meaning: "One interchangeable way to do the job",
    example: (
      <>
        Each function inside <Code>shippingStrategies</Code>
      </>
    ),
  },
  {
    role: "Context",
    meaning: "The code that uses a strategy without knowing which one",
    example: <Code>shippingCost</Code>,
  },
  {
    role: "Client",
    meaning: "The code that chooses which strategy to use",
    example: (
      <>
        The caller that passes <Code>&quot;express&quot;</Code>
      </>
    ),
  },
];

const whenToUse = [
  "There are several ways to do the same job.",
  "The right one is chosen while the program runs.",
  "New ways are added over time, and old code should not change when they are.",
];

export default function Page() {
  return (
    <ContentWithToc>
      <LessonTitle>Strategy Pattern</LessonTitle>
      <P>
        The Strategy pattern keeps several interchangeable ways of doing a job
        behind one name. The code that needs the job done picks a strategy and
        calls it, without caring how it works. In JavaScript a strategy is
        usually just a function.
      </P>

      <Section title="The problem: a growing if chain">
        <P>
          Say shipping costs depend on the delivery method. The first version
          checks the method with <Code>if</Code> statements.
        </P>
        <CodeBlock
          title="Every new method edits this function"
          code={`
function shippingCost(method, weight) {
  if (method === "standard") return 5 + weight * 0.5;
  if (method === "express") return 15 + weight;
  if (method === "overnight") return 30 + weight * 2;
  throw new Error("Unknown method: " + method);
}

console.log(shippingCost("standard", 4));
console.log(shippingCost("express", 4));
`}
          output={`
7
19
`}
        />
        <P>
          This works, but every new delivery method means reopening a function
          that already works and risking a mistake in the old branches.
        </P>
      </Section>

      <Section title="Strategies in an object">
        <P>
          Put each way of doing the job in its own function, and store them in
          an object keyed by name. The{" "}
          <LessonLink href="/js/lessons/js-basics/functions">Functions</LessonLink>{" "}
          lesson called this an object of functions. The function that uses them becomes
          a short lookup.
        </P>
        <CodeBlock
          title="An object of strategies"
          code={`
const shippingStrategies = {
  standard: (weight) => 5 + weight * 0.5,
  express: (weight) => 15 + weight,
  overnight: (weight) => 30 + weight * 2,
};

function shippingCost(method, weight) {
  if (!Object.hasOwn(shippingStrategies, method)) {
    throw new Error("Unknown method: " + method);
  }
  return shippingStrategies[method](weight);
}

console.log(shippingCost("standard", 4));
console.log(shippingCost("express", 4));
console.log(shippingCost("overnight", 4));

shippingStrategies.pickup = () => 0;   // a new strategy: one line
console.log(shippingCost("pickup", 4));
`}
          output={`
7
19
38
0
`}
        />
        <P>
          Adding <Code>pickup</Code> did not touch <Code>shippingCost</Code>.
          The pattern has three roles:
        </P>
        <ComparisonTable
          headers={["Role", "Meaning", "In this example"]}
          rows={strategyRoles.map(({ role, meaning, example }) => [
            role,
            meaning,
            example,
          ])}
        />
      </Section>

      <Section title="Passing a strategy in">
        <P>
          Instead of looking a strategy up by name, you can hand the function
          the strategy itself. This is how you have already been using the
          pattern: the comparison function you give to <Code>toSorted</Code> is
          a strategy for ordering.
        </P>
        <CodeBlock
          title="Two ways to order the same list"
          code={`
const byPrice = (a, b) => a.price - b.price;
const byName = (a, b) => a.name.localeCompare(b.name);

const products = [
  { name: "Pear", price: 3 },
  { name: "Apple", price: 5 },
  { name: "Fig", price: 1 },
];

function sortProducts(list, strategy) {
  return list.toSorted(strategy);
}

console.log(sortProducts(products, byPrice).map(({ name }) => name));
console.log(sortProducts(products, byName).map(({ name }) => name));
`}
          output={`
["Fig", "Pear", "Apple"]
["Apple", "Fig", "Pear"]
`}
        />
      </Section>

      <Section title="Strategies that carry settings">
        <P>
          A strategy often needs a setting, such as how much discount to give.
          Build it with a factory function. The returned function remembers the
          setting through a closure, and callers still treat every strategy the
          same way.
        </P>
        <CodeBlock
          title="Discount strategies built by factories"
          code={`
function percentOff(percent) {
  return (price) => price * (1 - percent / 100);
}

function flatOff(amount) {
  return (price) => Math.max(0, price - amount);
}

const noDiscount = (price) => price;

function checkout(price, discount) {
  return discount(price);
}

console.log(checkout(80, noDiscount));
console.log(checkout(80, percentOff(25)));
console.log(checkout(80, flatOff(100)));
`}
          output={`
80
60
0
`}
        />
        <Tip>
          Every strategy takes a price and returns a price. That shared shape is
          what makes them interchangeable. Keep it identical across strategies.
        </Tip>
      </Section>

      <Section title="Strategies as objects">
        <P>
          When a strategy needs more than one operation, use an object whose
          methods have the same names in every version. The code that uses it
          only needs those names to exist.
        </P>
        <CodeBlock
          title="Swapping a whole storage object"
          code={`
function createMemoryStore() {
  const data = {};
  return {
    save(key, value) {
      data[key] = value;
    },
    load(key) {
      return data[key];
    },
  };
}

function createLoggedStore() {
  const inner = createMemoryStore();
  return {
    save(key, value) {
      console.log("saving " + key);
      inner.save(key, value);
    },
    load: inner.load,
  };
}

function rememberName(store, name) {
  store.save("name", name);
  return store.load("name");
}

console.log(rememberName(createMemoryStore(), "Ada"));
console.log(rememberName(createLoggedStore(), "Grace"));
`}
          output={`
Ada
saving name
Grace
`}
        />
        <Note>
          <Code>rememberName</Code> receives its store as a parameter instead of
          reaching for a global one. That makes it easy to test with a fake
          store, which is the alternative to a singleton suggested in the{" "}
          <LessonLink href="/js/lessons/design-patterns/singleton">
            Singleton
          </LessonLink>{" "}
          lesson.
        </Note>
      </Section>

      <Section title="A strategy on this site">
        <P>
          The code blocks in these lessons run through a strategy. The runner
          for each language lives in an object keyed by language name, and{" "}
          <Code>getRunner(language)</Code> picks one. Every runner has the same
          <Code>run</Code> and <Code>runFiles</Code> methods, so the playground never checks
          which language it is running. When the jQuery unit needs a runner that
          works with the DOM, it becomes one more entry in that object and the
          playground stays unchanged.
        </P>
        <P>
          The same idea appears in smaller places. The colors for each kind of
          code token and each kind of console line are looked up from an object
          instead of chosen with an <Code>if</Code> chain.
        </P>
      </Section>

      <Section title="When to use it">
        <P>Use a strategy when:</P>
        <List items={whenToUse} />
        <Warning>
          Do not build a strategy object for two cases that will never grow. A
          single <Code>if</Code> is easier to read. The pattern pays off when the
          list of options keeps getting longer.
        </Warning>
      </Section>
    </ContentWithToc>
  );
}
