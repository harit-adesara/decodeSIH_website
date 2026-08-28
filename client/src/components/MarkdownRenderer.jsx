import React from "react";

/**
 * Robust React Markdown Renderer
 * Parses common Markdown syntax:
 * - Headers: #, ##, ###, ####
 * - Bold: **text** or __text__
 * - Italic: *text* or _text_
 * - Unordered lists: *, -, •
 * - Ordered lists: 1., 2., etc.
 * - Blockquotes: > quote
 * - Inline code: `code`
 * - Paragraphs and clean line breaks
 */
export const MarkdownRenderer = ({ content = "", className = "" }) => {
  if (!content || typeof content !== "string") return null;

  // Process text line by line
  const lines = content.split("\n");
  const elements = [];

  let currentList = null;
  let currentListType = null; // 'ul' | 'ol'
  let listKey = 0;

  const flushList = () => {
    if (currentList && currentList.length > 0) {
      if (currentListType === "ol") {
        elements.push(
          <ol key={`ol-${listKey++}`} className="list-decimal pl-5 space-y-1.5 my-2.5 text-inherit">
            {currentList.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {renderInlineFormatted(item)}
              </li>
            ))}
          </ol>
        );
      } else {
        elements.push(
          <ul key={`ul-${listKey++}`} className="space-y-1.5 my-2.5 text-inherit">
            {currentList.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-2 shrink-0" />
                <span className="flex-1">{renderInlineFormatted(item)}</span>
              </li>
            ))}
          </ul>
        );
      }
      currentList = null;
      currentListType = null;
    }
  };

  lines.forEach((rawLine, lineIdx) => {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    // Blank line
    if (!trimmed) {
      flushList();
      return;
    }

    // Headers
    if (trimmed.startsWith("#### ")) {
      flushList();
      elements.push(
        <h5
          key={`h4-${lineIdx}`}
          className="font-bold text-slate-900 text-xs uppercase tracking-wider mt-3 mb-1"
        >
          {renderInlineFormatted(trimmed.slice(5))}
        </h5>
      );
      return;
    }

    if (trimmed.startsWith("### ")) {
      flushList();
      elements.push(
        <h4
          key={`h3-${lineIdx}`}
          className="font-bold text-slate-900 text-sm sm:text-base mt-3.5 mb-1.5 text-teal-900 flex items-center gap-1.5"
        >
          {renderInlineFormatted(trimmed.slice(4))}
        </h4>
      );
      return;
    }

    if (trimmed.startsWith("## ")) {
      flushList();
      elements.push(
        <h3
          key={`h2-${lineIdx}`}
          className="font-extrabold text-slate-900 text-base sm:text-lg mt-4 mb-2 pb-1 border-b border-slate-200"
        >
          {renderInlineFormatted(trimmed.slice(3))}
        </h3>
      );
      return;
    }

    if (trimmed.startsWith("# ")) {
      flushList();
      elements.push(
        <h2
          key={`h1-${lineIdx}`}
          className="font-black text-slate-900 text-lg sm:text-xl mt-4 mb-2.5"
        >
          {renderInlineFormatted(trimmed.slice(2))}
        </h2>
      );
      return;
    }

    // Blockquote
    if (trimmed.startsWith("> ")) {
      flushList();
      elements.push(
        <blockquote
          key={`quote-${lineIdx}`}
          className="border-l-4 border-amber-500 bg-amber-50/70 p-3 rounded-r-2xl text-xs sm:text-sm text-slate-700 italic my-2"
        >
          {renderInlineFormatted(trimmed.slice(2))}
        </blockquote>
      );
      return;
    }

    // Horizontal divider
    if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
      flushList();
      elements.push(<hr key={`hr-${lineIdx}`} className="my-3 border-slate-200" />);
      return;
    }

    // Unordered list item (*, -, •)
    const ulMatch = trimmed.match(/^[\*\-•]\s+(.*)$/);
    if (ulMatch) {
      if (currentListType !== "ul") {
        flushList();
        currentList = [];
        currentListType = "ul";
      }
      currentList.push(ulMatch[1]);
      return;
    }

    // Ordered list item (1., 2., etc.)
    const olMatch = trimmed.match(/^\d+[\.\)]\s+(.*)$/);
    if (olMatch) {
      if (currentListType !== "ol") {
        flushList();
        currentList = [];
        currentListType = "ol";
      }
      currentList.push(olMatch[1]);
      return;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={`p-${lineIdx}`} className="my-1.5 leading-relaxed text-inherit">
        {renderInlineFormatted(trimmed)}
      </p>
    );
  });

  // Flush remaining list
  flushList();

  return (
    <div className={`space-y-1 text-slate-800 text-sm leading-relaxed ${className}`}>
      {elements}
    </div>
  );
};

/**
 * Helper to render inline formatting:
 * **bold**, *italic*, `code`, and clean emphasis
 */
function renderInlineFormatted(text) {
  if (!text) return "";

  // Split by bold tokens **...**
  const boldParts = text.split(/(\*\*.*?\*\*)/g);

  return boldParts.map((bPart, bIdx) => {
    if (bPart.startsWith("**") && bPart.endsWith("**") && bPart.length >= 4) {
      const innerBold = bPart.slice(2, -2);
      return (
        <strong key={`b-${bIdx}`} className="font-bold text-slate-900">
          {renderItalicAndCode(innerBold, `b-${bIdx}`)}
        </strong>
      );
    }
    return renderItalicAndCode(bPart, `t-${bIdx}`);
  });
}

function renderItalicAndCode(text, parentKey) {
  if (!text) return null;

  // Split by inline code `...`
  const codeParts = text.split(/(`.*?`)/g);

  return codeParts.map((cPart, cIdx) => {
    if (cPart.startsWith("`") && cPart.endsWith("`") && cPart.length >= 2) {
      return (
        <code
          key={`${parentKey}-c-${cIdx}`}
          className="bg-slate-100 text-teal-800 font-mono text-xs px-1.5 py-0.5 rounded border border-slate-200"
        >
          {cPart.slice(1, -1)}
        </code>
      );
    }

    // Split by italic *...* or _..._
    const italicParts = cPart.split(/(\*[^\*]+?\*|_[^_]+?_)/g);
    return italicParts.map((iPart, iIdx) => {
      if (
        (iPart.startsWith("*") && iPart.endsWith("*") && iPart.length >= 2) ||
        (iPart.startsWith("_") && iPart.endsWith("_") && iPart.length >= 2)
      ) {
        return (
          <em key={`${parentKey}-i-${iIdx}`} className="italic text-slate-700">
            {iPart.slice(1, -1)}
          </em>
        );
      }
      return iPart;
    });
  });
}

export default MarkdownRenderer;
