import type { Metadata } from "next";
import { CodePlayground } from "@/components/lesson/code-playground";
import type { Files } from "@/lib/runner";

export const metadata: Metadata = {
  title: "Coding Playground",
};

const starterFiles: Files = {
  "main.js": `console.log("Hello, JavaScript!");`,
};

export default function PlaygroundPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-10 pb-16 sm:px-6 sm:pt-16 lg:px-8 lg:pt-20">
      <p className="mb-3 text-xs font-medium tracking-[0.16em] text-primary uppercase">
        Experiment freely
      </p>
      <h1 className="font-heading text-5xl leading-none tracking-tight sm:text-7xl">
        Coding Playground
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
        Write <span className="font-medium text-primary">JavaScript</span>, run it,
        and see the output. Add up to five files and use relative imports to try
        out modules.
      </p>
      <div className="mt-8 rounded-xl border bg-card p-4 sm:p-6">
        <p className="mb-2 text-sm font-semibold">Working with multiple files</p>
        <p className="m-0 text-sm leading-6 text-muted-foreground">
          Add a file such as <code>helpers.js</code>, export a function from it,
          then import it in <code>main.js</code> with a relative path, for example{" "}
          <code>import &#123; greet &#125; from &quot;./helpers.js&quot;</code>. Use the
          active file as the entry when you want that file to run.
        </p>
      </div>
      <div className="mt-8">
        <CodePlayground
          title="Your workspace"
          files={starterFiles}
          entry="main.js"
          allowFileManagement
          maxFiles={5}
          minEditorHeight={320}
        />
      </div>
    </div>
  );
}
