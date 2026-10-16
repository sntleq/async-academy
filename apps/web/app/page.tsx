import { Button } from "@workspace/ui/components/button"
import { ContentWithToc } from "@/components/layout/content-with-toc"

export default function Page() {
  return (
    <ContentWithToc>
      <h1 className="font-heading text-2xl">Project ready!</h1>
      <p>You may now add components and start building.</p>
      <p>We&apos;ve already added the button component for you.</p>
      <Button className="mt-2">Button</Button>
      <h2 id="dark-mode" className="mt-8 font-heading text-xl">Dark mode</h2>
      <p className="text-muted-foreground font-mono text-xs">
        Press <kbd>d</kbd> to toggle dark mode.
      </p>
    </ContentWithToc>
  )
}