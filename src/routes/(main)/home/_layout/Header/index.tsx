'use client';

import { Flexbox } from '@lobehub/ui';
import { memo } from 'react';

import SideBarHeaderLayout from '@/features/NavPanel/SideBarHeaderLayout';
import NotificationsMenu from '@/features/NotificationsMenu';

import InboxButton from './components/InboxButton';
import Nav from './components/Nav';
import User from './components/User';

const Header = memo(() => {
  return (
    <>
      <SideBarHeaderLayout
        left={<User />}
        showBack={false}
        right={
          <Flexbox horizontal align={'center'} gap={4}>
            <NotificationsMenu />
            <InboxButton />
          </Flexbox>
        }
      />
      <Nav />
    </>
  );
});

export default Header;
