'use client';

import { ActionIcon, DropdownMenu, Icon } from '@lobehub/ui';
import { App, Badge, Button, Popconfirm, Popover, Segmented, Tooltip, Typography } from 'antd';
import {
  BellIcon,
  CheckIcon,
  CopyIcon,
  MoreVerticalIcon,
  PinIcon,
  SendIcon,
  SettingsIcon,
  TrashIcon,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import type { NotificationItem } from '@/store/notification';
import { useNotificationStore } from '@/store/notification';

const { Paragraph } = Typography;

const NotificationListItem = ({ item, colors }: { item: NotificationItem; colors: any }) => {
  const { markAsRead, markAsUnread, deleteNotification, togglePin, notifications } =
    useNotificationStore();
  const { message } = App.useApp();
  const { t } = useTranslation('common');

  const handleTogglePin = () => {
    const res = togglePin(item.id);
    if (!res.success && res.error) {
      message.error(res.error);
    }
  };

  const pinnedCount = notifications.filter((n) => n.pinned).length;
  const isPinLimitReached = !item.pinned && pinnedCount >= 5;

  const menuItems = [
    {
      key: 'copy',
      label: t('notification.actions.copy'),
      icon: <Icon icon={CopyIcon} />,
      onClick: () => {
        navigator.clipboard.writeText(item.content);
        message.success(t('notification.actions.copy'));
      },
    },
    {
      key: 'read',
      label: item.read
        ? t('notification.actions.markAsUnread')
        : t('notification.actions.markAsRead'),
      icon: <Icon icon={CheckIcon} />,
      onClick: () => (item.read ? markAsUnread(item.id) : markAsRead(item.id)),
    },
    {
      key: 'pin',
      label: (
        <Tooltip title={isPinLimitReached ? t('notification.actions.pinLimitReached') : ''}>
          <span>
            {item.pinned ? t('notification.actions.unpin') : t('notification.actions.pin')}
          </span>
        </Tooltip>
      ),
      icon: <Icon icon={PinIcon} />,
      disabled: isPinLimitReached,
      onClick: handleTogglePin,
    },
    {
      key: 'send',
      label: t('notification.actions.sendToIA'),
      icon: <Icon icon={SendIcon} />,
      onClick: () => message.info(t('notification.actions.soon')),
    },
    { type: 'divider' },
    {
      key: 'delete',
      label: t('notification.actions.delete'),
      icon: <Icon icon={TrashIcon} />,
      danger: true,
      onClick: () => deleteNotification(item.id),
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px 0',
        borderBottom: '1px solid var(--color-border-secondary)',
      }}
    >
      <Badge color={colors[item.type] || 'blue'} style={{ marginRight: 8 }} />
      <div
        style={{ flex: 1, minWidth: 0, cursor: item.actionPath ? 'pointer' : 'default' }}
        onClick={() => {
          if (item.actionPath) {
            markAsRead(item.id);
            window.location.href = item.actionPath;
          }
        }}
      >
        <div
          style={{
            fontWeight: 'bold',
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {item.pinned && <Icon icon={PinIcon} size="small" />}
          <span style={{ opacity: item.read ? 0.6 : 1 }}>{item.title}</span>
        </div>
        <Paragraph
          ellipsis={{ rows: 2 }}
          style={{ margin: 0, fontSize: 12, opacity: item.read ? 0.6 : 1 }}
        >
          {item.content}
        </Paragraph>
      </div>
      <DropdownMenu items={menuItems}>
        <ActionIcon icon={MoreVerticalIcon} size="small" />
      </DropdownMenu>
    </div>
  );
};

export const NotificationsMenu = () => {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'success' | 'error' | 'pinned'>('all');
  const navigate = useNavigate();
  const { notifications, clearAll, settings } = useNotificationStore();
  const { t } = useTranslation('common');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'success') return n.type === 'success';
    if (filter === 'error') return n.type === 'error';
    if (filter === 'pinned') return n.pinned;
    return true;
  });

  const content = (
    <div style={{ width: 320, marginTop: -4 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <h3 style={{ margin: 0 }}>{t('notification.title')}</h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Popconfirm title={t('notification.deleteAllConfirm')} onConfirm={clearAll}>
            <Button danger size="small" style={{ padding: '0 4px' }} type="text">
              {t('notification.deleteAll')}
            </Button>
          </Popconfirm>
          <ActionIcon
            icon={SettingsIcon}
            size="small"
            onClick={() => {
              setOpen(false);
              navigate('/settings/notification');
            }}
          />
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <Segmented
          block
          size="small"
          value={filter}
          options={[
            { label: t('notification.filters.all'), value: 'all' },
            { label: t('notification.filters.success'), value: 'success' },
            { label: t('notification.filters.error'), value: 'error' },
            { label: t('notification.filters.pinned'), value: 'pinned' },
          ]}
          onChange={(val) => setFilter(val as any)}
        />
      </div>
      <div style={{ maxHeight: 300, overflowY: 'auto', paddingRight: 8 }}>
        {filteredNotifications.length === 0 ? (
          <div style={{ padding: 16, textAlign: 'center', color: 'var(--color-text-description)' }}>
            {t('notification.empty')}
          </div>
        ) : (
          filteredNotifications
            .sort((a, b) => {
              if (a.pinned === b.pinned) return b.timestamp - a.timestamp;
              return a.pinned ? -1 : 1;
            })
            .map((n) => <NotificationListItem colors={settings.colors} item={n} key={n.id} />)
        )}
      </div>
    </div>
  );

  return (
    <Popover
      content={content}
      open={open}
      placement="bottomRight"
      trigger="click"
      onOpenChange={setOpen}
    >
      <Badge count={unreadCount} size="small">
        <ActionIcon icon={BellIcon} />
      </Badge>
    </Popover>
  );
};

export default NotificationsMenu;
