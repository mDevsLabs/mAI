'use client';

import { type BuiltinSkill, type LobeBuiltinTool } from '@lobechat/types';
import { Center, Empty } from '@lobehub/ui';
import { SkillsIcon } from '@lobehub/ui/icons';
import { Divider } from 'antd';
import { createStaticStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import AddSkillButton from '@/features/SkillStore/SkillList/AddSkillButton';
import { useFetchInstalledPlugins } from '@/hooks/useFetchInstalledPlugins';
import { serverConfigSelectors, useServerConfigStore } from '@/store/serverConfig';
import { useToolStore } from '@/store/tool';
import {
  agentSkillsSelectors,
  builtinToolSelectors,
import { type LobeToolType } from '@/types/tool/tool';

import AgentSkillItem from './AgentSkillItem';
import BuiltinSkillItem from './BuiltinSkillItem';

const styles = createStaticStyles(({ css, cssVar }) => ({
  container: css`
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,
  description: css`
    margin-block-end: 8px;
    color: ${cssVar.colorTextSecondary};
  `,
  empty: css`
    padding: 24px;
    color: ${cssVar.colorTextTertiary};
    text-align: center;
  `,
}));

const SkillList = memo(() => {
  const { t } = useTranslation('setting');

  const marketAgentSkills = useToolStore(agentSkillsSelectors.getMarketAgentSkills, isEqual);
  const userAgentSkills = useToolStore(agentSkillsSelectors.getUserAgentSkills, isEqual);
  const builtinSkills = useToolStore((s) => s.builtinSkills, isEqual);
  const allBuiltinTools = useToolStore((s) => s.builtinTools, isEqual);
  const uninstalledBuiltinTools = useToolStore(
    builtinToolSelectors.uninstalledBuiltinTools,
    isEqual,
  );

  const [
    useFetchAgentSkills,
    useFetchUninstalledBuiltinTools,
  ] = useToolStore((s) => [
    s.useFetchAgentSkills,
    s.useFetchUninstalledBuiltinTools,
  ]);

  useFetchAgentSkills(true);
  useFetchUninstalledBuiltinTools(true);

  const getBuiltinToolByIdentifier = (identifier: string) => {
    return allBuiltinTools.find((tool) => tool.identifier === identifier);
  };

  const isBuiltinToolInstalled = (identifier: string) => {
    return !uninstalledBuiltinTools.includes(identifier);
  };

  // Separate skills into three categories:
  // 1. Integrations (Builtin, LobeHub and Klavis skills)
  // 2. Community MCP Tools (type === 'plugin')
  // 3. Custom MCP Tools (type === 'customPlugin')
  const { integrations } = useMemo(() => {
    type IntegrationItem =
      | { builtinAgentSkill: BuiltinSkill; type: 'builtinAgent' }
      | { builtinTool: LobeBuiltinTool; type: 'builtin' };

    let integrationItems: IntegrationItem[] = [];

    // Add builtin agent skills first so they appear early in the list
    for (const skill of builtinSkills) {
      integrationItems.push({ builtinAgentSkill: skill, type: 'builtinAgent' });
    }

    const addedBuiltinIds = new Set<string>();

    // Default behavior: add all non-hidden builtin tools
    for (const tool of allBuiltinTools) {
      if (!tool.hidden) {
        integrationItems.push({ builtinTool: tool, type: 'builtin' });
      }
    }

    // Sort integrations: installed/connected ones first
    const getIsConnected = (item: IntegrationItem) => {
      switch (item.type) {
        case 'builtinAgent': {
          return isBuiltinToolInstalled(item.builtinAgentSkill.identifier);
        }
        case 'builtin': {
          return isBuiltinToolInstalled(item.builtinTool.identifier);
        }
      }
    };
    const sortedIntegrations = integrationItems.sort((a, b) => {
      const isConnectedA = getIsConnected(a);
      const isConnectedB = getIsConnected(b);

      if (isConnectedA && !isConnectedB) return -1;
      if (!isConnectedA && isConnectedB) return 1;
      return 0;
    });

    return {
      integrations: sortedIntegrations,
    };
  }, [
    allBuiltinTools,
    uninstalledBuiltinTools,
    builtinSkills,
  ]);

  const hasAnySkills =
    builtinSkills.length > 0 ||
    integrations.length > 0 ||
    marketAgentSkills.length > 0 ||
    userAgentSkills.length > 0;

  if (!hasAnySkills) {
    return (
      <Center className={styles.container} paddingBlock={48}>
        <Empty description={t('tab.skillDesc')} icon={SkillsIcon} title={t('tab.skillEmpty')} />
        <AddSkillButton />
      </Center>
    );
  }

  const renderIntegrations = () =>
    integrations.map((item) => {
      if (item.type === 'builtinAgent') {
        return (
          <AgentSkillItem key={item.builtinAgentSkill.identifier} skill={item.builtinAgentSkill} />
        );
      }
      if (item.type === 'builtin') {
        const localizedTitle = t(`tools.builtins.${item.builtinTool.identifier}.title`, {
          defaultValue: item.builtinTool.manifest.meta?.title || item.builtinTool.identifier,
        });
        return (
          <BuiltinSkillItem
            avatar={item.builtinTool.manifest.meta?.avatar}
            identifier={item.builtinTool.identifier}
            key={item.builtinTool.identifier}
            title={localizedTitle}
          />
        );
      }
    });

  const renderMarketAgentSkills = () =>
    marketAgentSkills.map((skill) => <AgentSkillItem key={skill.id} skill={skill} />);

  const renderUserAgentSkills = () =>
    userAgentSkills.map((skill) => <AgentSkillItem key={skill.id} skill={skill} />);

  const hasIntegrationsSection = integrations.length > 0;
  const hasCommunitySection = marketAgentSkills.length > 0;
  const hasCustomSection = userAgentSkills.length > 0;

  return (
    <div className={styles.container}>
      {integrations.length > 0 && renderIntegrations()}
      {hasIntegrationsSection && hasCommunitySection && <Divider style={{ margin: 0 }} />}
      {marketAgentSkills.length > 0 && renderMarketAgentSkills()}
      {(hasIntegrationsSection || hasCommunitySection) && hasCustomSection && (
        <Divider style={{ margin: 0 }} />
      )}
      {userAgentSkills.length > 0 && renderUserAgentSkills()}
      <div style={{ marginTop: 8 }}>
        <AddSkillButton />
      </div>
    </div>
  );
});

SkillList.displayName = 'SkillList';

export default SkillList;
