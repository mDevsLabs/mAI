import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';
import { type DynamicLayoutProps } from '@/types/next';
import { RouteVariants } from '@/utils/server/routeVariants';

import SignInClientPage from './ClientPage';

export const generateMetadata = async (props: DynamicLayoutProps) => {
  const locale = await RouteVariants.getLocale(props);
  const { t } = await translation('auth', locale);

  return metadataModule.generate({
    alternate: true,
    description: t('betterAuth.signin.subtitle'),
    tags: ['connexion', 'signin', 'IA', 'mAI', 'login'],
    title: t('betterAuth.signin.title'),
    url: '/signin',
  });
};

const SignInPage = () => {
  return <SignInClientPage />;
};

export default SignInPage;
