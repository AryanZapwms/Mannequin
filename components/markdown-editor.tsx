"use client";

import { useState, useRef, useCallback } from "react";
import {
  Bold,
  Italic,
  Link,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Code,
  Eye,
  Edit3,
} from "lucide-react";

interface MarkdownEditorProps {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
}

function renderMarkdownPreview(md: string): string {
  return md
    // Headings
    .replace(/^### (.+)$/gm, "<h3 class='text-lg font-semibold mt-4 mb-2'>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2 class='text-xl font-bold mt-5 mb-2'>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1 class='text-2xl font-extrabold mt-6 mb-3'>$1</h1>")
    // Bold + italic
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Inline code
    .replace(/`([^`]+)`/g, "<code class='rounded bg-gray-100 px-1 py-0.5 text-sm font-mono text-red-600'>$1</code>")
    // Blockquote
    .replace(/^> (.+)$/gm, "<blockquote class='border-l-4 border-gray-300 pl-4 italic text-gray-600 my-2'>$1</blockquote>")
    // Unordered list
    .replace(/^[*-] (.+)$/gm, "<li class='ml-4 list-disc'>$1</li>")
    // Ordered list
    .replace(/^\d+\. (.+)$/gm, "<li class='ml-4 list-decimal'>$1</li>")
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, "<a href='$2' class='text-blue-600 underline'>$1</a>")
    // Horizontal rule
    .replace(/^---$/gm, "<hr class='my-4 border-gray-200' />")
    // Paragraphs
    .replace(/\n\n/g, "</p><p class='mb-3'>")
    // Newlines
    .replace(/\n/g, "<br />");
}

const TOOLBAR_ACTIONS = [
  { icon: Heading1, label: "Heading 1", prefix: "# ", suffix: "" },
  { icon: Heading2, label: "Heading 2", prefix: "## ", suffix: "" },
  { icon: Bold, label: "Bold", prefix: "**", suffix: "**" },
  { icon: Italic, label: "Italic", prefix: "*", suffix: "*" },
  { icon: Code, label: "Inline Code", prefix: "`", suffix: "`" },
  { icon: Quote, label: "Blockquote", prefix: "> ", suffix: "" },
  { icon: List, label: "Bullet List", prefix: "- ", suffix: "" },
  { icon: ListOrdered, label: "Ordered List", prefix: "1. ", suffix: "" },
  { icon: Link, label: "Link", prefix: "[", suffix: "](https://)" },
];

export function MarkdownEditor({
  name,
  defaultValue = "",
  placeholder = "Write your content in Markdown…",
  rows = 18,
}: MarkdownEditorProps) {
  const [value, setValue] = useState(defaultValue);
  const [preview, setPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertMarkdown = useCallback(
    (prefix: string, suffix: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = value.slice(start, end);
      const newValue =
        value.slice(0, start) + prefix + selected + suffix + value.slice(end);

      setValue(newValue);
      // Restore focus and cursor after state update
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + prefix.length,
          start + prefix.length + selected.length
        );
      });
    },
    [value]
  );

  return (
    <div className="rounded-xl border border-input overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 border-b border-input bg-muted/30 px-3 py-2 flex-wrap">
        {TOOLBAR_ACTIONS.map(({ icon: Icon, label, prefix, suffix }) => (
          <button
            key={label}
            type="button"
            title={label}
            onClick={() => insertMarkdown(prefix, suffix)}
            className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        ))}

        <div className="ml-auto flex items-center gap-1 border-l border-input pl-2">
          <button
            type="button"
            title="Edit"
            onClick={() => setPreview(false)}
            className={`flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors ${
              !preview
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Edit3 className="h-3 w-3" /> Edit
          </button>
          <button
            type="button"
            title="Preview"
            onClick={() => setPreview(true)}
            className={`flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors ${
              preview
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Eye className="h-3 w-3" /> Preview
          </button>
        </div>
      </div>

      {/* Editor / Preview */}
      {preview ? (
        <div
          className="min-h-[200px] p-4 text-sm text-foreground leading-relaxed"
          style={{ minHeight: `${rows * 1.6}rem` }}
          dangerouslySetInnerHTML={{
            __html: value
              ? `<p class='mb-3'>${renderMarkdownPreview(value)}</p>`
              : "<p class='text-muted-foreground italic'>Nothing to preview yet.</p>",
          }}
        />
      ) : (
        <textarea
          ref={textareaRef}
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full resize-y bg-background px-4 py-3 text-sm font-mono focus:outline-none"
        />
      )}

      {/* Word / char count */}
      <div className="border-t border-input bg-muted/20 px-4 py-1.5 text-right text-xs text-muted-foreground">
        {value.trim().split(/\s+/).filter(Boolean).length} words ·{" "}
        {value.length} characters
      </div>
    </div>
  );
}
