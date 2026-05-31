import {ProviderIcon as OriginalProviderIcon } from '@lobehub/icons/es';
import { Avatar } from '@lobehub/ui';
import React from 'react';

export * from '@lobehub/icons/es';

interface ProviderIconProps {
  [key: string]: any;
  forceMono?: boolean;
  provider?: string;
  shape?: 'circle' | 'square';
  size?: number;
  type?: 'avatar' | 'mono' | 'color' | 'combine' | 'combine-color';
}

export const ProviderIcon = React.memo(({ provider, size = 12, type = 'avatar', shape, ...rest }: ProviderIconProps) => {
  if (provider && provider.toLowerCase() === 'lobehub') {
    if (type === 'avatar') {
      return (
        <Avatar
          shape={shape}
          size={size}
          src="/icons/icon-512x512.png"
          {...rest}
        />
      );
    }
    
    return (
      <img
        alt="mAI"
        height={size}
        src="/icons/icon-512x512.png"
        width={size}
        style={{
          borderRadius: shape === 'circle' ? '50%' : '4px',
          objectFit: 'contain'
        }}
        {...rest}
      />
    );
  }

  return (
    <OriginalProviderIcon
      provider={provider}
      shape={shape}
      size={size}
      type={type}
      {...rest}
    />
  );
});

ProviderIcon.displayName = 'ProviderIcon';

export const LobeHub = React.memo(({ size = 24, ...rest }: { size?: number; [key: string]: any }) => {
  return (
    <img
      alt="mAI"
      height={size}
      src="/icons/icon-512x512.png"
      width={size}
      {...rest}
    />
  );
});

LobeHub.displayName = 'LobeHub';
