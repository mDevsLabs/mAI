'use client';

import { ActionIcon, Tooltip } from '@lobehub/ui';
import { PlusIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { DESKTOP_HEADER_ICON_SMALL_SIZE } from '@/const/layoutTokens';

import { createCreateNewProviderModal } from '../features/CreateNewProvider';

const AddNewProvider = () => {
  const { t } = useTranslation('modelProvider');

  return (
    <ActionIcon
      icon={PlusIcon}
      size={DESKTOP_HEADER_ICON_SMALL_SIZE}
      title={t('menu.addCustomProvider')}
      onClick={() => createCreateNewProviderModal()}
    />
  );

  return canManageProvider ? button : <Tooltip title={reason}>{button}</Tooltip>;
};

export default AddNewProvider;
