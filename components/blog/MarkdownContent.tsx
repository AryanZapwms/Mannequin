import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Renders blog post Markdown with the Mannequin Care brand typography —
 * Cormorant display headings, Nunito body, gold/copper accents — instead of
 * relying on the Tailwind typography plugin (not installed here).
 */
const components: Components = {
  h1: ({ children }) => (
    <h1 className="mt-10 mb-4 font-display text-[clamp(1.75rem,3vw,2.5rem)] font-light leading-[1.15] text-brand-espresso">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-10 mb-3 font-display text-[clamp(1.5rem,2.4vw,2rem)] font-light leading-[1.2] text-brand-espresso">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-8 mb-2 font-sub text-lg font-semibold uppercase tracking-[0.06em] text-brand-copper">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="mt-6 mb-2 font-sub text-base font-semibold text-brand-espresso">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="mb-5 font-body text-[1.0625rem] leading-[1.85] text-brand-body">
      {children}
    </p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-brand-espresso">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ href, children }) => {
    const target = href ?? "#";
    const isInternal = target.startsWith("/");
    const className =
      "font-medium text-brand-copper underline decoration-brand-gold-400 underline-offset-2 transition-colors hover:text-brand-espresso";
    return isInternal ? (
      <Link href={target} className={className}>
        {children}
      </Link>
    ) : (
      <a
        href={target}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    );
  },
  ul: ({ children }) => (
    <ul className="mb-6 ml-1 space-y-2.5 font-body text-[1.0625rem] leading-[1.7] text-brand-body marker:text-brand-gold-500 [&>li]:list-disc [&>li]:ml-5 [&>li]:pl-1.5">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-6 ml-1 space-y-2.5 font-body text-[1.0625rem] leading-[1.7] text-brand-body marker:font-semibold marker:text-brand-copper [&>li]:list-decimal [&>li]:ml-5 [&>li]:pl-1.5">
      {children}
    </ol>
  ),
  li: ({ children }) => <li>{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-6 border-l-2 border-brand-gold-400 pl-5 font-display text-xl font-light italic leading-[1.5] text-brand-body">
      {children}
    </blockquote>
  ),
  hr: () => (
    <div aria-hidden className="my-10 flex justify-center">
      <span className="h-px w-16 bg-brand-gold-400" />
    </div>
  ),
  img: ({ src, alt }) =>
    typeof src === "string" ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt ?? ""}
        className="my-6 w-full rounded-card border border-brand-sand"
      />
    ) : null,
  code: ({ children }) => (
    <code className="rounded bg-brand-linen px-1.5 py-0.5 font-mono text-[0.9em] text-brand-espresso">
      {children}
    </code>
  ),
};

export default function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
