"use client";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface PrintContentProps {
  title: string;
  content: string;
  author: string;
  date: string;
  description?: string;
}

export function PrintContent({ title, content, author, date, description }: PrintContentProps) {

  return (
    <div 
      id="print-content"
      className={`max-w-4xl mx-auto p-8 font-sans text-slate-900 bg-white`}
    >
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        <div className="flex items-center gap-6 text-sm text-slate-600">
          <span>Par {author}</span>
          <span>{date}</span>
        </div>
        {description && (
          <p className="mt-4 text-lg leading-relaxed">{description}</p>
        )}
      </div>
      
      <div 
        className="prose max-w-none 
          prose-headings:text-slate-900
          prose-p:text-slate-700
          prose-a:text-orange-600
          prose-strong:text-slate-900
          prose-em:text-slate-700"
      >
        <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
      </div>
    </div>
  );
}

export { PrintContent as default };
