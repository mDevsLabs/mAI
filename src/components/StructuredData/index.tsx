import { type FC } from 'react';

const StructuredData: FC<{ ld: any }> = ({ ld }) => {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(ld)?.replaceAll('<', '\\u003c') || '' }}
      id="structured-data"
      type="application/ld+json"
    />
  );
};
export default StructuredData;
