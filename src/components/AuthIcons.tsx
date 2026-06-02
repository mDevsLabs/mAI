import {
  SiCanva,
  SiDiscord,
  SiNotion,
  SiSpotify,
  SiTwitch,
  SiX,
} from '@icons-pack/react-simple-icons';
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
  'canva': SiCanva,
  'casdoor': Casdoor.Color,
  'cloudflare': Cloudflare.Color,
  'cognito': Aws.Color,
  'discord': SiDiscord,
  'github': Github,
  'google': Google.Color,
  'logto': Logto.Color,
  'microsoft': Microsoft.Color,
  'microsoft-entra-id': MicrosoftEntra.Color,
  'notion': SiNotion,
  'spotify': SiSpotify,
  'twitch': SiTwitch,
  'twitter': SiX,
  'zitadel': Zitadel.Color,
};

const AuthIcons = (id: string, size = 36) => {
  const normalizedId = id.toLowerCase();
  if (normalizedId === 'google') {
    return (
      <img
        src="/auth/google-logo.png"
        width={size}
        height={size}
        alt="Google"
        style={{ objectFit: 'contain', verticalAlign: 'middle' }}
      />
    );
  }
  if (normalizedId === 'github') {
    return (
      <img
        src="/auth/github-logo.png"
        width={size}
        height={size}
        alt="GitHub"
        style={{ objectFit: 'contain', verticalAlign: 'middle' }}
      />
    );
  }
  if (normalizedId === 'discord') {
    return (
      <img
        src="/auth/discord-logo.png"
        width={size}
        height={size}
        alt="Discord"
        style={{ objectFit: 'contain', verticalAlign: 'middle' }}
      />
    );
  }
  if (normalizedId === 'twitch') {
    return (
      <img
        src="/auth/twitch-logo.png"
        width={size}
        height={size}
        alt="Twitch"
        style={{ objectFit: 'contain', verticalAlign: 'middle' }}
      />
    );
  }
  if (normalizedId === 'spotify') {
    return (
      <img
        src="/auth/spotify-logo.png"
        width={size}
        height={size}
        alt="Spotify"
        style={{ objectFit: 'contain', verticalAlign: 'middle' }}
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
