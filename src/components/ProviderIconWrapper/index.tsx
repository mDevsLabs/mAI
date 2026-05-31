import React from 'react';
import { Avatar } from '@lobehub/ui';
import { ProviderIcon as OriginalProviderIcon, LobeHub as OriginalLobeHub } from '@lobehub/icons/es';

export * from '@lobehub/icons/es';

interface ProviderIconProps {
  provider?: string;
  size?: number;
  type?: 'avatar' | 'mono' | 'color' | 'combine' | 'combine-color';
  forceMono?: boolean;
  shape?: 'circle' | 'square';
  [key: string]: any;
}

export const ProviderIcon = React.memo(({ provider, size = 12, type = 'avatar', shape, ...rest }: ProviderIconProps) => {
  if (provider && provider.toLowerCase() === 'lobehub') {
    if (type === 'avatar') {
      return (
        <Avatar
          src="/icons/icon-192x192.png"
          size={size}
          shape={shape}
          {...rest}
        />
      );
    }
    
    return (
      <img
        src="/icons/icon-192x192.png"
        width={size}
        height={size}
        style={{
          borderRadius: shape === 'circle' ? '50%' : '4px',
          objectFit: 'contain'
        }}
        alt="mAI"
        {...rest}
      />
    );
  }

  return (
    <OriginalProviderIcon
      provider={provider}
      size={size}
      type={type}
      shape={shape}
      {...rest}
    />
  );
});

ProviderIcon.displayName = 'ProviderIcon';

export const LobeHub = React.memo(({ size = 24, ...rest }: { size?: number; [key: string]: any }) => {
  return (
    <img
      src="/icons/icon-192x192.png"
      width={size}
      height={size}
      alt="mAI"
      {...rest}
    />
  );
});

LobeHub.displayName = 'LobeHub';
