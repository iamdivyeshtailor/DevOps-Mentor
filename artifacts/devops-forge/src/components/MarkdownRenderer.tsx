import { marked } from "marked";
import { useMemo } from "react";

marked.use({
  gfm: true,
  breaks: false,
});

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const html = useMemo(() => marked.parse(content) as string, [content]);

  return (
    <div
      className={[
        "prose prose-invert prose-sm max-w-none",
        "prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground",
        "prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3",
        "prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-2",
        "prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:my-3",
        "prose-li:text-muted-foreground prose-li:my-0.5",
        "prose-ul:my-3 prose-ol:my-3",
        "prose-strong:text-foreground prose-strong:font-semibold",
        "prose-code:bg-muted prose-code:rounded prose-code:px-1.5 prose-code:py-0.5",
        "prose-code:text-sm prose-code:font-mono prose-code:text-primary",
        "prose-code:before:content-none prose-code:after:content-none",
        "prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-xl prose-pre:p-4 prose-pre:my-4",
        "prose-pre:code:bg-transparent prose-pre:code:p-0 prose-pre:code:text-sm prose-pre:code:text-muted-foreground",
        "prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground",
        "prose-hr:border-border",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
