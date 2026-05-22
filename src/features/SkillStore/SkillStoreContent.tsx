'use client';

import { Flexbox, Segmented } from '@lobehub/ui';
import { type SegmentedOptions } from 'antd/es/segmented';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Search from './Search';
import AddSkillButton from './SkillList/AddSkillButton';
import CustomList from './SkillList/Custom';
import MarketSkillList from './SkillList/MarketSkills';

export enum SkillStoreTab {
  Custom = 'custom',
  Skills = 'skills',
}

export const SkillStoreContent = () => {
  const { t } = useTranslation('setting');
  const [activeTab, setActiveTab] = useState<SkillStoreTab>(SkillStoreTab.Skills);
  const [skillKeywords, setSkillKeywords] = useState('');

  const options: SegmentedOptions = [
    { label: 'Skills', value: SkillStoreTab.Skills },
    { label: t('skillStore.tabs.custom'), value: SkillStoreTab.Custom },
  ];

  const isSkills = activeTab === SkillStoreTab.Skills;
  const isCustom = activeTab === SkillStoreTab.Custom;

  return (
    <Flexbox gap={8} style={{ maxHeight: '75vh' }} width={'100%'}>
      <Flexbox gap={8} paddingInline={16}>
        <Flexbox horizontal align={'center'} gap={8}>
          <Segmented
            block
            options={options}
            style={{ flex: 1 }}
            value={activeTab}
            variant={'filled'}
            onChange={(v) => setActiveTab(v as SkillStoreTab)}
          />
          <AddSkillButton />
        </Flexbox>
        <Search
          activeTab={activeTab}
          onSkillSearch={setSkillKeywords}
        />
      </Flexbox>
      <Flexbox height={496}>
        <Flexbox flex={1} style={{ display: isSkills ? 'flex' : 'none', overflow: 'auto' }}>
          <MarketSkillList keywords={skillKeywords} />
        </Flexbox>
        <Flexbox flex={1} style={{ display: isCustom ? 'flex' : 'none', overflow: 'auto' }}>
          <CustomList />
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
};
