import urlJoin from 'url-join';

export const OFFICIAL_URL = 'https://app.lobehub.com';
export const OFFICIAL_SITE = 'https://lobehub.com';
export const OFFICIAL_DOMAIN = 'lobehub.com';

export const OG_URL = '/og/og.webp?v=1';

export const GITHUB = 'https://github.com/mDevsLabs/mAI';
export const GITHUB_ISSUES = urlJoin(GITHUB, 'issues/new/choose');
export const CHANGELOG = 'https://mprojects.odoo.com';

export const DOCUMENTS = 'https://mprojects.odoo.com';
export const USAGE_DOCUMENTS = 'https://mprojects.odoo.com';
export const SELF_HOSTING_DOCUMENTS = 'https://mprojects.odoo.com';
export const DATABASE_SELF_HOSTING_URL = 'https://mprojects.odoo.com';

// use this for the link
export const DOCUMENTS_REFER_URL = 'https://mprojects.odoo.com';

export const WIKI_PLUGIN_GUIDE = 'https://mprojects.odoo.com';
export const MANUAL_UPGRADE_URL = 'https://mprojects.odoo.com';

export const BLOG = 'https://mprojects.odoo.com';

export const ABOUT = 'https://mprojects.odoo.com';
export const FEEDBACK = 'https://mprojects.odoo.com';
export const PRIVACY_URL = 'https://mprojects.odoo.com';
export const TERMS_URL = 'https://mprojects.odoo.com';

export const PLUGINS_INDEX_URL = 'https://chat-plugins.lobehub.com';

export const MORE_MODEL_PROVIDER_REQUEST_URL =
  'https://github.com/lobehub/lobe-chat/discussions/6157';

export const MORE_FILE_PREVIEW_REQUEST_URL =
  'https://github.com/lobehub/lobe-chat/discussions/3684';

export const AGENTS_INDEX_GITHUB = 'https://github.com/lobehub/lobe-chat-agents';
export const AGENTS_INDEX_GITHUB_ISSUE = urlJoin(AGENTS_INDEX_GITHUB, 'issues/new');
export const AGENTS_OFFICIAL_URL = 'https://lobehub.com/agent';

export const AGENT_CHAT_URL = (agentId: string, mobile?: boolean) => {
  if (mobile) return `/agent/${agentId}`;
  return `/agent/${agentId}`;
};

export const AGENT_CHAT_TOPIC_URL = (agentId: string, topicId: string, mobile?: boolean) => {
  if (mobile) return urlJoin('/agent', agentId, topicId);
  return urlJoin('/agent', agentId, topicId);
};

export const AGENT_CHAT_TOPIC_PAGE_URL = (agentId: string, topicId: string, mobile?: boolean) => {
  if (mobile) return urlJoin('/agent', agentId, topicId, 'page');
  return urlJoin('/agent', agentId, topicId, 'page');
};

export const AGENT_PROFILE_URL = (agentId: string) => `/agent/${agentId}/profile`;

export const GROUP_CHAT_URL = (groupId: string) => `/group/${groupId}`;

export const GROUP_CHAT_TOPIC_URL = (groupId: string, topicId: string) =>
  urlJoin('/group', groupId, topicId);

export const LIBRARY_URL = (id: string) => urlJoin('/resource/library', id);

export const imageUrl = (filename: string) => `/images/${filename}`;

export const LOBE_URL_IMPORT_NAME = 'settings';

export const RELEASES_URL = urlJoin(GITHUB, 'releases');

export const mailTo = (email: string) => `mailto:${email}`;

export const AES_GCM_URL = 'https://datatracker.ietf.org/doc/html/draft-ietf-avt-srtp-aes-gcm-01';
export const BASE_PROVIDER_DOC_URL = 'https://mprojects.odoo.com';
export const CHANGELOG_URL = 'https://mprojects.odoo.com';

export const DOWNLOAD_URL = {
  android: 'https://play.google.com/store/apps/details?id=com.lobehub.app',
  default: urlJoin(OFFICIAL_SITE, '/downloads'),
  ios: 'https://testflight.apple.com/join/2ZbjX4Qp',
} as const;
