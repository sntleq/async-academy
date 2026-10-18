// lessons/js-basics/arrays/

import { ContentWithToc } from "@/components/layout/content-with-toc";
import Link from "next/link";
import { buttonVariants } from "@workspace/ui/components/button";
import {
  Code,
  CodeBlock,
  ComparisonTable,
  LessonLink,
  LessonTitle,
  Note,
  P,
  Section,
  SubSection,
  Tip,
  Warning,
} from "@/components/lesson/lesson-ui";

export const metadata = { title: "Arrays" };

// Arrays of objects: the two tables below are built from them with map().
const changingMethods = [
  {
    method: "push(item)",
    does: "Adds to the end",
    returns: "New length",
  },
  {
    method: "pop()",
    does: "Removes the last item",
    returns: "Removed item",
  },
  {
    method: "unshift(item)",
    does: "Adds to the start",
    returns: "New length",
  },
  {
    method: "shift()",
    does: "Removes the first item",
    returns: "Removed item",
  },
  {
    method: "splice(i, n, ...items)",
    does: "Removes n items at index i, then inserts any items given",
    returns: "Array of removed items",
  },
  {
    method: "sort(fn)",
    does: "Orders the items",
    returns: "The same array",
  },
  {
    method: "reverse()",
    does: "Reverses the order",
    returns: "The same array",
  },
];

const leaveAloneMethods = [
  {
    method: "slice(start, end)",
    does: "Copies a portion",
    returns: "New array",
  },
  {
    method: "map(fn)",
    does: "Transforms every item",
    returns: "New array",
  },
  {
    method: "filter(fn)",
    does: "Keeps items that pass a test",
    returns: "New array",
  },
  {
    method: "toSorted(fn)",
    does: "Orders a copy",
    returns: "New array",
  },
  {
    method: "find(fn)",
    does: "Finds the first match",
    returns: "Item or undefined",
  },
  {
    method: "includes(item)",
    does: "Checks whether an item is present",
    returns: "true or false",
  },
  {
    method: "indexOf(item)",
    does: "Finds the position of an item",
    returns: "Index, or -1 if missing",
  },
  {
    method: "some(fn)",
    does: "Checks whether any item passes a test",
    returns: "true or false",
  },
  {
    method: "every(fn)",
    does: "Checks whether all items pass a test",
    returns: "true or false",
  },
  {
    method: "reduce(fn, start)",
    does: "Combines items into one value",
    returns: "The combined value",
  },
  {
    method: "join(separator)",
    does: "Joins items into a string",
    returns: "A string",
  },
];

export default function Page() {
  return (
    <ContentWithToc>
      <LessonTitle>Arrays</LessonTitle>
      <P>
        An array is an ordered list of values. Each item has a numbered
        position, called an index, that starts at 0. Arrays can hold any mix of
        types, including other arrays. This lesson covers creating, reading,
        changing, copying, searching, looping, and sorting.
      </P>

      <Section title="Creating arrays">
        <CodeBlock
          title="Common ways to create an array"
          code={`
const fruits = ["apple", "banana", "cherry"];   // literal: use this
const letters = Array.from("abc");              // from any iterable, such as a string
const words = "one two three".split(" ");       // split a string into an array
const copy = [...fruits];                       // copy with spread
const zeros = new Array(3).fill(0);             // a list of a given length, all set to 0

console.log(fruits);
console.log(letters);
console.log(words);
console.log(copy);
console.log(zeros);
console.log(words.join("-"));                   // join is the reverse of split
`}
          output={`
["apple", "banana", "cherry"]
["a", "b", "c"]
["one", "two", "three"]
["apple", "banana", "cherry"]
[0, 0, 0]
one-two-three
`}
        />
        <CodeBlock
          title="The new Array(3) trap"
          code={`
console.log(new Array(3));     // one number: a length, so three empty slots
console.log(new Array(3, 4));  // two arguments: they become the items
console.log(Array.of(3));      // always items, so an array holding 3
`}
          output={`
[,,,]
[3, 4]
[3]
`}
        />
        <Note>
          That inconsistency is why the literal form is preferred.{" "}
          <Code>new Array(3).fill(0)</Code> is the one common use of the
          constructor: it makes a list of a known length.
        </Note>
        <CodeBlock
          title="Checking whether something is an array"
          code={`
console.log(typeof []);          // "object"
console.log(Array.isArray([]));  // true
console.log(Array.isArray({}));  // false
`}
          output={`
object
true
false
`}
        />
        <Warning>
          <Code>typeof</Code> reports <Code>&quot;object&quot;</Code> for
          arrays, so it cannot tell them apart from plain objects. Use{" "}
          <Code>Array.isArray(value)</Code> instead.
        </Warning>
      </Section>

      <Section title="Reading items">
        <P>
          Use square brackets with an index to read an item. Reading past the
          end gives <Code>undefined</Code> instead of an error.
        </P>
        <CodeBlock
          title="Index access and length"
          code={`
const fruits = ["apple", "banana", "cherry"];

console.log(fruits[0]);      // first item: indexes start at 0
console.log(fruits[2]);      // third item
console.log(fruits.at(-1));  // last item: negative numbers count from the end
console.log(fruits[10]);     // no such index
console.log(fruits.length);  // number of items
`}
          output={`
apple
cherry
cherry
undefined
3
`}
        />

        <SubSection title="Unpacking with destructuring">
          <P>
            Destructuring unpacks items from an array into separate variables in
            a single declaration, by position.
          </P>
          <CodeBlock
            title="Array destructuring"
            code={`
const fruits = ["apple", "banana", "cherry"];

const [first, second] = fruits;             // by position
console.log(first, second);

const [head, ...tail] = fruits;             // ...tail collects the rest
console.log(head, tail);

const [red, green, blue = 0] = [255, 128];  // a default fills in for a missing item
console.log(red, green, blue);

let a = 1;
let b = 2;
[a, b] = [b, a];                            // swap two variables without a temporary
console.log(a, b);
`}
            output={`
apple banana
apple ["banana", "cherry"]
255 128 0
2 1
`}
          />
        </SubSection>
      </Section>

      <Section title="Changing items">
        <P>
          Assign to an index to replace an item. The methods below also change
          the array itself instead of making a new one, which is called
          mutating. Pay attention to what each one returns, because it is often
          not the array.
        </P>
        <ComparisonTable
          headers={["Method", "What it does", "Returns"]}
          rows={changingMethods.map(({ method, does, returns }) => [
            <Code key={method}>{method}</Code>,
            does,
            returns,
          ])}
        />
        <CodeBlock
          title="Adding and removing at the ends"
          code={`
const fruits = ["apple", "banana", "cherry"];

fruits[1] = "blueberry";              // replace by index
console.log(fruits.push("date"));     // push returns the new length
console.log(fruits.shift());          // shift returns the item it removed
fruits.unshift("avocado");            // add to the start

console.log(fruits);
`}
          output={`
4
apple
["avocado", "blueberry", "cherry", "date"]
`}
        />
        <CodeBlock
          title="splice removes and inserts at an index"
          code={`
const letters = ["a", "b", "c", "d", "e"];

const removed = letters.splice(1, 2);   // from index 1, remove 2 items
console.log(removed);
console.log(letters);

letters.splice(1, 0, "x", "y");         // from index 1, remove 0, insert "x" and "y"
console.log(letters);
`}
          output={`
["b", "c"]
["a", "d", "e"]
["a", "x", "y", "d", "e"]
`}
        />
        <CodeBlock
          title="const locks the variable, not the array"
          code={`
const list = [1, 2];
list.push(3);        // fine: the array changes, the variable does not
console.log(list);   // [1, 2, 3]

list = [4, 5];       // TypeError: Assignment to constant variable.
`}
        />
        <Tip>
          Before using a method, know whether it mutates. If you need the
          original later, copy first or use a method from the quick reference at
          the end of this lesson.
        </Tip>
      </Section>

      <Section title="Copying arrays">
        <P>
          Assigning an array to another variable does not copy it. Both names
          point at the same array, so a change through one shows up through the
          other.
        </P>
        <CodeBlock
          title="Same array versus a real copy"
          code={`
const original = [1, 2, 3];

const same = original;          // not a copy: both names point at one array
same.push(4);
console.log(original);

const copy = [...original];     // a real copy (original.slice() also works)
copy.push(5);
console.log(original);
console.log(copy);
console.log(copy.slice(1, 3));  // slice(start, end) copies a portion; end is not included
`}
          output={`
[1, 2, 3, 4]
[1, 2, 3, 4]
[1, 2, 3, 4, 5]
[2, 3]
`}
        />
        <Note>
          These copies are shallow. If the array holds objects or other arrays,
          the copy holds the same ones. The{" "}
          <LessonLink href="/js/lessons/js-basics/objects">Objects</LessonLink>{" "}
          lesson shows how to make a deep copy.
        </Note>
      </Section>

      <Section title="Searching and testing">
        <Note>
          The functions passed to <Code>find</Code>, <Code>some</Code>, and{" "}
          <Code>every</Code>, such as{" "}
          <Code>{"(fruit) => fruit.length > 5"}</Code>, are arrow functions used
          as callbacks. Read one as a recipe applied to each item: given a
          fruit, return true or false. The{" "}
          <LessonLink href="/js/lessons/js-basics/functions">Functions</LessonLink>{" "}
          lesson covers them in full.
        </Note>
        <CodeBlock
          title="Finding items and testing them"
          code={`
const fruits = ["apple", "banana", "cherry"];

console.log(fruits.includes("banana"));                      // is it in there?
console.log(fruits.indexOf("cherry"));                       // its position
console.log(fruits.indexOf("kiwi"));                         // -1 means not found
console.log(fruits.find((fruit) => fruit.startsWith("b")));  // first item that passes
console.log(fruits.find((fruit) => fruit.startsWith("z")));  // nothing passes
console.log(fruits.some((fruit) => fruit.length > 5));       // does any item pass?
console.log(fruits.every((fruit) => fruit.length > 5));      // do all items pass?
`}
          output={`
true
2
-1
banana
undefined
true
false
`}
        />
      </Section>

      <Section title="Looping over arrays">
        <CodeBlock
          title="Three ways to visit every item"
          code={`
const prices = [10, 25, 40];

for (let i = 0; i < prices.length; i++) {
  console.log("index loop:", i, prices[i]);
}

for (const price of prices) {
  console.log("for...of:", price);
}

prices.forEach((price, index) => {
  console.log("forEach:", index, price);
});
`}
          output={`
index loop: 0 10
index loop: 1 25
index loop: 2 40
for...of: 10
for...of: 25
for...of: 40
forEach: 0 10
forEach: 1 25
forEach: 2 40
`}
        />
        <Note>
          You can leave a <Code>for</Code> or <Code>for...of</Code> loop early
          with <Code>break</Code>, but not a <Code>forEach</Code>.
        </Note>
        <Tip>
          Need the index with <Code>for...of</Code>? Loop over{" "}
          <Code>prices.entries()</Code> and destructure each pair:{" "}
          <Code>{"for (const [index, price] of prices.entries())"}</Code>.
        </Tip>
      </Section>

      <Section title="Transforming with map, filter, and reduce">
        <P>
          These three never change the original array. <Code>map</Code> returns
          a new array of the same length, <Code>filter</Code> returns a new
          array of the items that pass, and <Code>reduce</Code> boils the array
          down to one value. It carries a running value through the array,
          starting from its second argument. At each step the function receives
          the running value and the current item, and returns the next running
          value.
        </P>
        <CodeBlock
          title="map, filter, reduce, and chaining"
          code={`
const prices = [10, 25, 40];

const doubled = prices.map((price) => price * 2);
const expensive = prices.filter((price) => price > 20);
const total = prices.reduce((sum, price) => sum + price, 0);

console.log(doubled);
console.log(expensive);
console.log(total);
console.log(prices);   // unchanged

// Methods that return arrays can be chained
console.log(prices.filter((price) => price > 20).map((price) => price * 2));
`}
          output={`
[20, 50, 80]
[25, 40]
75
[10, 25, 40]
[50, 80]
`}
        />
      </Section>

      <Section title="Sorting">
        <P>
          Sorting has two traps. By default, items are compared as text, and{" "}
          <Code>sort</Code> changes the array it is called on.
        </P>
        <CodeBlock
          title="The default order compares as text"
          code={`
const numbers = [10, 1, 9];

console.log(numbers.toSorted());                 // default: "1" < "10" < "9"
console.log(numbers.toSorted((a, b) => a - b));  // numeric, smallest first
console.log(numbers.toSorted((a, b) => b - a));  // numeric, largest first
console.log(numbers);                            // toSorted left the original alone
`}
          output={`
[1, 10, 9]
[1, 9, 10]
[10, 9, 1]
[10, 1, 9]
`}
        />
        <CodeBlock
          title="Sorting words"
          code={`
const names = ["banana", "Cherry", "apple"];

console.log(names.toSorted());                              // capital letters sort first
console.log(names.toSorted((a, b) => a.localeCompare(b)));  // alphabetical
`}
          output={`
["Cherry", "apple", "banana"]
["apple", "banana", "Cherry"]
`}
        />
        <CodeBlock
          title="sort changes the original"
          code={`
const scores = [3, 1, 2];
const sorted = scores.sort((a, b) => a - b);

console.log(scores);             // the original changed
console.log(sorted === scores);  // and sort returned that same array, not a copy
`}
          output={`
[1, 2, 3]
true
`}
        />
        <Note>
          <Code>toSorted</Code>, <Code>toReversed</Code>, and{" "}
          <Code>toSpliced</Code> are copy-making versions of <Code>sort</Code>,{" "}
          <Code>reverse</Code>, and <Code>splice</Code>. They are part of
          ES2023, so they need a recent browser or Node 20 or newer.
        </Note>
      </Section>

      <Section title="Quick reference: methods that leave the array alone">
        <P>
          None of these change the array they are called on. Each one gives you
          back something new.
        </P>
        <ComparisonTable
          headers={["Method", "What it does", "Returns"]}
          rows={leaveAloneMethods.map(({ method, does, returns }) => [
            <Code key={method}>{method}</Code>,
            does,
            returns,
          ])}
        />
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
          href="/js/lessons/js-basics/arrays/quiz"
          className={buttonVariants({ size: "lg" })}
        >
          Start the quiz
        </Link>
      </section>
    </ContentWithToc>
  );
}