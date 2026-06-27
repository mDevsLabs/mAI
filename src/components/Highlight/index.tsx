import { Fragment, memo } from 'react';

export interface HighlightProps {
  keyword?: string;
  text?: string;
}

const Highlight = memo<HighlightProps>(({ keyword, text }) => {
  if (!text) return null;
  if (!keyword) return <>{text}</>;

  const parts = text.split(new RegExp(`(${keyword})`, 'gi'));
  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === keyword.toLowerCase() ? (
          <mark
            key={index}
            style={{ backgroundColor: 'var(--ant-color-warning-bg)', color: 'inherit', padding: 0 }}
          >
            {part}
          </mark>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        )
      )}
    </>
  );
});

Highlight.displayName = 'Highlight';

export default Highlight;
