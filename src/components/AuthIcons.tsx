import { User } from 'lucide-react';
import { type ReactNode } from 'react';

import { normalizeProviderId } from '@/libs/better-auth/utils/client';

const localAuthIcons: Record<string, string> = {
  canva: '/auth/canva-logo.png',
  github: '/auth/github-logo.png',
  google: '/auth/google-logo.png',
  notion: '/auth/notion-logo.png',
  railway: '/auth/railway-logo.png',
  slack: '/auth/slack-logo.png',
  spotify: '/auth/spotify-logo.png',
  telegram: '/auth/telegram-logo.png',
  twitch: '/auth/twitch-logo.png',
  x: '/auth/x-logo.png',
};

const renderLocalIcon = (src: string, size: number) => {
  return (
    <img
      alt=""
      aria-hidden
      height={size}
      loading="lazy"
      src={src}
      style={{ display: 'block', objectFit: 'contain' }}
      width={size}
    />
  );
};

/**
 * Get the auth icons component for the given provider id
 */
const AuthIcons = (id: string, size = 36): ReactNode => {
  const normalizedId = normalizeProviderId(id);
  const localIcon = localAuthIcons[normalizedId];
  if (localIcon) {
    return renderLocalIcon(localIcon, size);
  }

  // Fallback to generic user icon for unknown providers
  return <User size={size} />;
};

export default AuthIcons;
