import React from "react";

/**
 * Renders inline markdown formatting:
 * - **bold** or __bold__ -> <strong>
 * - *italic* or _italic_ -> <em>
 * - `code` -> <code>
 */
export function FormattedText({
  text,
  className,
}: {
  text?: string;
  className?: string;
}) {
  if (!text) return null;

  // Split by markdown bold (**...** or __...__), italic (*...* or _..._), inline code (`...`)
  const parts = text.split(/(\*\*.*?\*\*|__.*?__|\*[^*]+?\*|`.*?`)/g);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (
          ((part.startsWith("**") && part.endsWith("**")) ||
            (part.startsWith("__") && part.endsWith("__"))) &&
          part.length >= 4
        ) {
          return (
            <strong key={index} className="font-semibold text-neutral-900">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
          return (
            <em key={index} className="italic">
              {part.slice(1, -1)}
            </em>
          );
        }
        if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
          return (
            <code
              key={index}
              className="bg-neutral-100 text-neutral-800 px-1 py-0.5 rounded text-[0.9em] font-mono"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
}

/**
 * Strips markdown asterisks, underscores, and backticks from plain text strings
 */
export function stripMarkdown(text?: string): string {
  if (!text) return "";
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/\*([^*]+?)\*/g, "$1")
    .replace(/`(.*?)`/g, "$1");
}
