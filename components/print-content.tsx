import { FormattedText } from "./formatted-text";

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
      style={{ whiteSpace: 'pre-wrap' }}
    >
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        <div className="flex items-center gap-6 text-sm text-slate-600">
          <span>Par {author}</span>
          <span>{date}</span>
        </div>
        {description && (
          <p className="mt-4 text-lg leading-relaxed">
            <FormattedText text={description} />
          </p>
        )}
      </div>
      
      <div 
        className="prose max-w-none 
          prose-headings:text-slate-900
          prose-p:text-slate-700
          prose-a:text-orange-600
          prose-strong:text-slate-900
          prose-em:text-slate-700"
        dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }}
      />
    </div>
  );
}

export { PrintContent as default };
