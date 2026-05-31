'use client';

import { Button, Flex, Typography } from 'antd';
import { createStaticStyles } from 'antd-style';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useExtensionStore } from '@/features/ExtensionsSidebarPanel';

const useStyles = createStaticStyles(({ css }) => ({
  openButton: css`
    animation: scaleFadeIn 0.35s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;

    @keyframes scaleFadeIn {
      from {
        opacity: 0;
        transform: scale(0.93);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
  `,
}));

const ExtensionsPage = () => {
  const { t } = useTranslation('extensions');
  const { isOpen, setIsOpen } = useExtensionStore();
  const { styles } = useStyles();

  return (
    <Flex
      vertical
      align="center"
      justify="center"
      style={{ height: '100%', width: '100%', gap: 16 }}
    >
      <Sparkles size={48} style={{ color: 'var(--color-primary)' }} />
      <Typography.Title level={3} style={{ margin: 0 }}>
        {t('extensions.title')}
      </Typography.Title>
      <Typography.Text type="secondary">
        {t('extensions.selectService')}
      </Typography.Text>
      {!isOpen && (
        <Button
          className={styles.openButton}
          data-testid="open-extensions-panel"
          style={{ marginTop: 8 }}
          type="primary"
          onClick={() => setIsOpen(true)}
        >
          {t('extensions.openPanel')}
        </Button>
      )}
    </Flex>
  );
};

ExtensionsPage.displayName = 'ExtensionsPage';

export default ExtensionsPage;
