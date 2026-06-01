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

const AuthIcons = (id: string, size = 36) => {
  const normalizedId = id.toLowerCase();
  if (normalizedId === 'google') {
    return (
      <img
        alt="Google"
        height={size}
        src="/auth/google-logo.png"
        style={{ objectFit: 'contain', verticalAlign: 'middle' }}
        width={size}
      />
    );
  }
  if (normalizedId === 'github') {
    return (
      <img
        alt="GitHub"
        height={size}
        src="/auth/github-logo.png"
        style={{ objectFit: 'contain', verticalAlign: 'middle' }}
        width={size}
      />
    );
  }
  if (normalizedId === 'discord') {
    return (
      <img
        alt="Discord"
        height={size}
        src="/auth/discord-logo.png"
        style={{ objectFit: 'contain', verticalAlign: 'middle' }}
        width={size}
      />
    );
  }
  if (normalizedId === 'twitch') {
    return (
      <img
        alt="Twitch"
        height={size}
        src="/auth/twitch-logo.png"
        style={{ objectFit: 'contain', verticalAlign: 'middle' }}
        width={size}
      />
    );
  }
  if (normalizedId === 'spotify') {
    return (
      <img
        alt="Spotify"
        height={size}
        src="/auth/spotify-logo.png"
        style={{ objectFit: 'contain', verticalAlign: 'middle' }}
        width={size}
      />
    );
  }
  if (normalizedId === 'x') {
    return (
      <img
        alt="X"
        height={size}
        src="/auth/x-logo.png"
        style={{ objectFit: 'contain', verticalAlign: 'middle' }}
        width={size}
      />
    );
  }
  if (normalizedId === 'canva') {
    return (
      <img
        alt="Canva"
        height={size}
        src="/auth/canva-logo.png"
        style={{ objectFit: 'contain', verticalAlign: 'middle' }}
        width={size}
      />
    );
  }
  if (normalizedId === 'notion') {
    return (
      <img
        alt="Notion"
        height={size}
        src="/auth/notion-logo.png"
        style={{ objectFit: 'contain', verticalAlign: 'middle' }}
        width={size}
      />
    );
  }

  const IconComponent = iconComponents[normalizedId];
  if (IconComponent) {
    return <IconComponent size={size} />;
  }
  // Fallback to generic user icon for unknown providers
  return <User size={size} />;
};

export default AuthIcons;
