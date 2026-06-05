import { authEnv } from '@/envs/auth';

import { type BuiltinProviderDefinition } from '../types';

const provider: BuiltinProviderDefinition<
  {
    AUTH_SLACK_ID: string;
    AUTH_SLACK_SECRET: string;
  },
  'slack'
> = {
  build: (env) => {
    return {
      clientId: env.AUTH_SLACK_ID,
      clientSecret: env.AUTH_SLACK_SECRET,
    };
  },
  checkEnvs: () => {
    return !!(authEnv.AUTH_SLACK_ID && authEnv.AUTH_SLACK_SECRET)
      ? {
          AUTH_SLACK_ID: authEnv.AUTH_SLACK_ID,
          AUTH_SLACK_SECRET: authEnv.AUTH_SLACK_SECRET,
        }
      : false;
  },
  id: 'slack',
  type: 'builtin',
};

export default provider;
