'use client';

import { Accordion, AccordionItem, Flexbox, SearchBar, Text } from '@lobehub/ui';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router';

import Highlight from '@/components/Highlight';
import NavItem from '@/features/NavPanel/components/NavItem';
import { useWorkspaceAwareNavigate } from '@/features/Workspace/useWorkspaceAwareNavigate';
import { SettingsTabs } from '@/store/global/initialState';
import { isModifierClick } from '@/utils/navigation';

import { SettingsGroupKey, useCategory } from '../../hooks/useCategory';

const Body = memo(() => {
  const categoryGroups = useCategory();
  const navigate = useWorkspaceAwareNavigate();
  const { t } = useTranslation('common');
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  // Extract current tab from pathname: /settings/profile -> profile
  const activeTab = useMemo(() => {
    const pathParts = location.pathname.split('/');
    // pathname is like /settings/profile or /settings/provider/xxx
    if (pathParts.length >= 3) {
      return pathParts[2] as SettingsTabs;
    }
    return SettingsTabs.Profile;
  }, [location.pathname]);

  const getTabUrl = (tab: SettingsTabs) => {
    return tab === SettingsTabs.Provider ? '/settings/provider/all' : `/settings/${tab}`;
  };

  const filteredGroups = useMemo(() => {
    if (!searchQuery) return categoryGroups;
    return categoryGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          item.label.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [categoryGroups, searchQuery]);

  const totalResults = useMemo(() => {
    return filteredGroups.reduce((acc, group) => acc + group.items.length, 0);
  }, [filteredGroups]);

  return (
    <Flexbox gap={8} paddingInline={4}>
      <Flexbox paddingInline={8}>
        <SearchBar
          allowClear
          onInputChange={setSearchQuery}
          placeholder={t('search')}
          value={searchQuery}
        />
        {searchQuery && (
          <Text fontSize={12} type={'secondary'} style={{ paddingLeft: 8, marginTop: 4 }}>
            {t('searchResults', { count: totalResults })}
          </Text>
        )}
      </Flexbox>
      <Accordion
        gap={8}
        defaultExpandedKeys={[
          SettingsGroupKey.General,
          SettingsGroupKey.Subscription,
          SettingsGroupKey.Rewards,
          SettingsGroupKey.Agent,
          SettingsGroupKey.System,
        ]}
      >
        {filteredGroups.map((group) => (
          <AccordionItem
            itemKey={group.key}
            key={group.key}
            paddingBlock={4}
            paddingInline={'8px 4px'}
            title={
              <Text ellipsis fontSize={12} type={'secondary'} weight={500}>
                {group.title}
              </Text>
            }
          >
            <Flexbox gap={1} paddingBlock={1}>
              {group.items.map((item) => {
                const url = item.href ?? getTabUrl(item.key);
                return (
                  <Link
                    key={item.key}
                    to={url}
                    onClick={(e) => {
                      if (isModifierClick(e)) return;
                      e.preventDefault();
                      navigate(url);
                    }}
                  >
                    <NavItem
                      active={activeTab === item.key}
                      icon={item.icon}
                      title={<Highlight keyword={searchQuery} text={item.label} />}
                    />
                  </Link>
                );
              })}
            </Flexbox>
          </AccordionItem>
        ))}
      </Accordion>
    </Flexbox>
  );
});

export default Body;
