'use client';

import { Flex } from 'antd';
import { Outlet } from 'react-router-dom';

import ExtensionsSidebarPanel from '@/features/ExtensionsSidebarPanel';

const ExtensionsLayout = () => {
  return (
    <Flex style={{ height: '100%', width: '100%', background: 'var(--color-bg-layout)' }}>
      <ExtensionsSidebarPanel />
      <div style={{ flex: 1, height: '100%' }}>
        <Outlet />
      </div>
    </Flex>
  );
};

ExtensionsLayout.displayName = 'ExtensionsLayout';

export default ExtensionsLayout;
