import { Apple, Aws, Google, Microsoft } from '@lobehub/icons';
import {
  Auth0,
  Authelia,
  Authentik,
  Casdoor,
  Cloudflare,
  Github,
  Logto,
  MicrosoftEntra,
  Zitadel,
} from '@lobehub/ui/icons';
import { User } from 'lucide-react';
import { type ReactNode } from 'react';

import { normalizeProviderId } from '@/libs/better-auth/utils/client';

const localAuthIcons: Record<string, string> = {
  canva: '/auth/canva-logo.png',
  discord: '/auth/discord-logo.png',
  github: '/auth/github-logo.png',
  google: '/auth/google-logo.png',
  notion: '/auth/notion-logo.png',
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

const iconComponents: { [key: string]: any } = {
  'apple': Apple,
  'auth0': Auth0,
  'authelia': Authelia.Color,
  'authentik': Authentik.Color,
  'casdoor': Casdoor.Color,
  'cloudflare': Cloudflare.Color,
  'cognito': Aws.Color,
  'github': Github,
  'google': Google.Color,
  'logto': Logto.Color,
  'microsoft': Microsoft.Color,
  'microsoft-entra-id': MicrosoftEntra.Color,
  'zitadel': Zitadel.Color,
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

  const IconComponent = iconComponents[normalizedId] || iconComponents[id];
  if (IconComponent) {
    return <IconComponent size={size} />;
  }
  // Fallback to generic user icon for unknown providers
  return <User size={size} />;
};

export default AuthIcons;
