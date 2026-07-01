'use client';

import { Flexbox } from '@lobehub/ui';
import { type FC, type ReactNode } from 'react';
import { Outlet } from 'react-router';

interface BlogLayoutProps {
  children?: ReactNode;
}

const BlogLayout: FC<BlogLayoutProps> = () => {
  return (
    <Flexbox flex={1} height={'100%'}>
      <Outlet />
    </Flexbox>
  );
};

export default BlogLayout;