'use client';

import { Flex, Typography, Button } from 'antd';
import { createStaticStyles } from 'antd-style';
import { Sparkles } from 'lucide-react';
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
        mServices
      </Typography.Title>
      <Typography.Text type="secondary">
        Sélectionnez un service dans le panneau de gauche pour commencer.
      </Typography.Text>
      {!isOpen && (
        <Button
          type="primary"
          className={styles.openButton}
          data-testid="open-extensions-panel"
          onClick={() => setIsOpen(true)}
          style={{ marginTop: 8 }}
        >
          Ouvrir le panneau
        </Button>
      )}
    </Flex>
  );
};

ExtensionsPage.displayName = 'ExtensionsPage';

export default ExtensionsPage;
