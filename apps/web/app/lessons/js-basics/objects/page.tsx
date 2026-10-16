// lessons/js-basics/objects/

import { ContentWithToc } from "@/components/layout/content-with-toc";
import {
  Code,
  CodeBlock,
  LessonTitle,
  Note,
  P,
  Section,
  SubSection,
  Tip,
  Warning,
} from "@/components/lesson/lesson-ui";

export const metadata = { title: "Objects" };

export default function Page() {
  return (
    <ContentWithToc>
      <LessonTitle>Objects</LessonTitle>
      <P>
        An object holds named values, called properties. Where an array is a
        list you read by position, an object is a record you read by name. Real
        programs combine both, which is the last section of this lesson.
      </P>

      <Section title="Creating objects">
        <P>
          The object literal is what you want almost every time: curly braces
          around <Code>key: value</Code> pairs. Values can be any type,
          including arrays, other objects, and functions.
        </P>
        <CodeBlock
          title="An object literal"
          code={`
const user = {
  name: "Ada",
  age: 36,
  tags: ["admin", "editor"],
  address: { city: "Lisbon" },
};

console.log(user);
`}
          output={`{ name: "Ada", age: 36, tags: ["admin", "editor"], address: { city: "Lisbon" } }`}
        />
        <P>
          When you need many similar objects, write a function that builds and
          returns one. This is called a factory function.
        </P>
        <CodeBlock
          title="A factory function returns a new object each call"
          code={`
function createUser(name, role = "student") {
  return { name, role };
}

const ada = createUser("Ada");
const grace = createUser("Grace", "teacher");
const ada2 = createUser("Ada");

console.log(ada);
console.log(grace);
console.log(ada === ada2);   // same contents, but two separate objects
`}
          output={`
{ name: "Ada", role: "student" }
{ name: "Grace", role: "teacher" }
false
`}
        />
        <Tip>
          Factory functions are a design pattern of their own. You will build
          more with them in the Design Patterns unit.
        </Tip>

        <SubSection title="Other ways you will see">
          <CodeBlock
            title="fromEntries, Object.create, constructors, and classes"
            code={`
// Object.fromEntries: build an object from key/value pairs
const fromPairs = Object.fromEntries([["name", "Ada"], ["age", 36]]);
console.log(fromPairs);

// Object.create: choose the object to fall back on (the prototype)
const base = {
  greet() {
    return "Hi, " + this.name;
  },
};
const viaCreate = Object.create(base);
viaCreate.name = "Ada";
console.log(viaCreate.greet());

// Constructor function and class: blueprints you call with new
function User(name) {
  this.name = name;
}
console.log(new User("Ada"));

class Account {
  constructor(owner) {
    this.owner = owner;
  }
}
console.log(new Account("Ada"));
`}
            output={`
{ name: "Ada", age: 36 }
Hi, Ada
User { name: "Ada" }
Account { owner: "Ada" }
`}
          />
          <Note>
            You do not need constructors, classes, or{" "}
            <Code>Object.create</Code> yet. They are here so you recognize them
            when they show up in other code.
          </Note>
        </SubSection>
      </Section>

      <Section title="Reading and writing properties">
        <CodeBlock
          title="Dot and bracket notation"
          code={`
const user = {
  name: "Ada",
  "favorite-color": "teal",
  address: { city: "Lisbon" },
};

console.log(user.name);                // dot notation
console.log(user["favorite-color"]);   // bracket notation: needed for keys that are not valid names
console.log(user.address.city);        // nested access

const key = "name";
console.log(user[key]);                // bracket notation also accepts a variable

console.log(user.phone);               // a missing property is undefined, not an error
`}
          output={`
Ada
teal
Lisbon
Ada
undefined
`}
        />
        <CodeBlock
          title="Adding, updating, and removing"
          code={`
const user = { name: "Ada", "favorite-color": "teal" };

user.age = 36;                  // add
user.name = "Ada L.";           // update
delete user["favorite-color"];  // remove

console.log(user);
`}
          output={`{ name: "Ada L.", age: 36 }`}
        />
        <CodeBlock
          title="Optional chaining and checking for keys"
          code={`
const user = { name: "Ada", address: { city: "Lisbon" } };

console.log(user.phone?.number);              // undefined: ?. stops at the missing phone
// console.log(user.phone.number);            // TypeError: cannot read properties of undefined

console.log("name" in user);                  // true
console.log("toString" in user);              // true: every object inherits toString
console.log(Object.hasOwn(user, "name"));     // true
console.log(Object.hasOwn(user, "toString")); // false: not one of the object's own keys
`}
          output={`
undefined
true
true
true
false
`}
        />
        <Tip>
          For plain data objects, <Code>Object.hasOwn</Code> is the check you
          usually want, because <Code>in</Code> also finds inherited keys.
        </Tip>
      </Section>

      <Section title="Shorthand and computed keys">
        <CodeBlock
          title="Modern object literal syntax"
          code={`
const name = "Ada";
const field = "score";

const player = {
  name,            // shorthand for name: name
  [field]: 100,    // computed key: the key is the value of field
  greet() {        // method shorthand
    return "Hi, " + this.name;
  },
};

console.log(player.greet());
console.log(player.score);
`}
          output={`
Hi, Ada
100
`}
        />
      </Section>

      <Section title="Unpacking with destructuring">
        <P>
          Destructuring pulls properties out of an object into separate
          variables in one declaration. Unlike arrays, it works by name, not by
          position.
        </P>
        <CodeBlock
          title="Object destructuring"
          code={`
const user = { name: "Ada", role: "admin", address: { city: "Lisbon" } };

const { name, role } = user;                     // by name
console.log(name, role);

const { role: position, active = true } = user;  // rename, and a default for a missing key
console.log(position, active);

const { address: { city } } = user;              // reach into a nested object
console.log(city);
`}
          output={`
Ada admin
admin true
Lisbon
`}
        />
      </Section>

      <Section title="Looping over objects">
        <CodeBlock
          title="keys, values, and entries"
          code={`
const stock = { apples: 5, pears: 0, plums: 12 };

console.log(Object.keys(stock));
console.log(Object.values(stock));

for (const [fruit, count] of Object.entries(stock)) {
  console.log(fruit, count);
}

for (const fruit in stock) {   // also works, but visits inherited keys too
  console.log(fruit);
}
`}
          output={`
["apples", "pears", "plums"]
[5, 0, 12]
apples 5
pears 0
plums 12
apples
pears
plums
`}
        />
        <Tip>
          Prefer <Code>Object.entries</Code> when you loop. It gives you the key
          and the value together and only visits the object&apos;s own
          properties.
        </Tip>
      </Section>

      <Section title="References, copying, and merging">
        <P>
          A variable that holds an object does not contain the object. It holds
          a reference to it. Copying the variable copies the reference, so both
          names point at the same object.
        </P>
        <CodeBlock
          title="Two names, one object"
          code={`
const a = { count: 1 };
const b = a;           // not a copy
b.count = 2;

console.log(a.count);
console.log(a === b);
console.log({ count: 1 } === { count: 1 });   // equal contents, different objects
`}
          output={`
2
true
false
`}
        />
        <CodeBlock
          title="Spread makes a copy you can override"
          code={`
const defaults = { theme: "light", fontSize: 16 };

const prefs = { ...defaults, theme: "dark" };                  // copy, then override
const merged = Object.assign({}, defaults, { fontSize: 18 });  // older way to do the same

console.log(prefs);
console.log(merged);
console.log(defaults);   // unchanged
`}
          output={`
{ theme: "dark", fontSize: 16 }
{ theme: "light", fontSize: 18 }
{ theme: "light", fontSize: 16 }
`}
        />
        <CodeBlock
          title="Spread is shallow, structuredClone is deep"
          code={`
const original = { tags: ["js"] };
const shallow = { ...original };
const deep = structuredClone(original);

shallow.tags.push("web");
console.log(original.tags);  // shared with the shallow copy
console.log(deep.tags);      // independent
`}
          output={`
["js", "web"]
["js"]
`}
        />
        <Note>
          A shallow copy only copies the top level. Anything nested, like the{" "}
          <Code>tags</Code> array above, is still shared with the original.
        </Note>
      </Section>

      <Section title="const and freezing">
        <CodeBlock
          title="const does not protect the object"
          code={`
const user = { name: "Ada" };
user.name = "Grace";        // fine: the object changes
console.log(user.name);     // "Grace"

user = { name: "Linus" };   // TypeError: Assignment to constant variable.
`}
        />
        <CodeBlock
          title="Object.freeze protects the top level only"
          code={`
const settings = Object.freeze({ mode: "strict", limits: { max: 3 } });

settings.mode = "loose";     // silently ignored in a plain script
settings.limits.max = 10;    // allowed: freezing is shallow

console.log(settings.mode);
console.log(settings.limits.max);
console.log(Object.isFrozen(settings));
`}
          output={`
strict
10
true
`}
        />
        <Warning>
          <Code>const</Code> only stops you from reassigning the variable. Use{" "}
          <Code>Object.freeze</Code> to stop changes to the object itself, and
          remember that nested objects stay editable. In strict mode, which
          modules and classes use, a blocked assignment throws a TypeError
          instead of being ignored.
        </Warning>
      </Section>

      <Section title="Arrays of objects">
        <P>
          The most common data shape in JavaScript is an array of objects.
          Combine the array methods from the previous lesson with destructuring
          in the callback parameters to work with it. In{" "}
          <Code>{"({ title }) => title"}</Code>, the braces pull the{" "}
          <Code>title</Code> property out of each object.
        </P>
        <CodeBlock
          title="Working with an array of objects"
          code={`
const lessons = [
  { title: "Variables", unit: "JS Basics", minutes: 10 },
  { title: "Arrays", unit: "JS Basics", minutes: 12 },
  { title: "Factory Pattern", unit: "Design Patterns", minutes: 12 },
];

const titles = lessons.map(({ title }) => title);
const basics = lessons.filter(({ unit }) => unit === "JS Basics");
const totalMinutes = lessons.reduce((sum, { minutes }) => sum + minutes, 0);
const factory = lessons.find(({ title }) => title.includes("Factory"));

console.log(titles);
console.log(basics.length);
console.log(totalMinutes);
console.log(factory.unit);
`}
          output={`
["Variables", "Arrays", "Factory Pattern"]
2
34
Design Patterns
`}
        />
        <CodeBlock
          title="Updating one object without changing the original"
          code={`
const lessons = [
  { title: "Variables", unit: "JS Basics", minutes: 10 },
  { title: "Arrays", unit: "JS Basics", minutes: 12 },
];

const updated = lessons.map((lesson) =>
  lesson.title === "Arrays" ? { ...lesson, minutes: 15 } : lesson
);

console.log(updated[1]);
console.log(lessons[1]);   // the original is untouched
`}
          output={`
{ title: "Arrays", unit: "JS Basics", minutes: 15 }
{ title: "Arrays", unit: "JS Basics", minutes: 12 }
`}
        />
        <Tip>
          The sidebar on this site works exactly like this: an array of unit
          objects, each holding an array of lesson objects, rendered with{" "}
          <Code>map</Code>.
        </Tip>
      </Section>
    </ContentWithToc>
  );
}