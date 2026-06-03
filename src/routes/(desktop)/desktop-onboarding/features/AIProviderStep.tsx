'use client';

import { TraceNameMap } from '@lobechat/types';
import { ProviderIcon } from '@lobehub/icons';
import { Alert,Block, Button, Flexbox, Input, Text } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { CheckCircle2Icon,GlobeIcon, KeyRoundIcon, Loader2Icon, Undo2Icon } from 'lucide-react';
import { memo, useCallback, useEffect,useState } from 'react';
import { useTranslation } from 'react-i18next';

import { chatService } from '@/services/chat';
import { aiProviderSelectors, useAiInfraStore } from '@/store/aiInfra';

import LobeMessage from '../components/LobeMessage';
import OnboardingFooterActions from '../components/OnboardingFooterActions';

type ProviderId = 'openai' | 'google' | 'anthropic';

interface AIProviderStepProps {
  onBack: () => void;
  onNext: () => void;
}

const AIProviderStep = memo<AIProviderStepProps>(({ onBack, onNext }) => {
  const { t } = useTranslation('desktop-onboarding');
  const [selectedProvider, setSelectedProvider] = useState<ProviderId>('openai');
  const [apiKey, setApiKey] = useState('');
  const [baseURL, setBaseURL] = useState('');

  // Connectivity Test State
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [testErrorMessage, setTestErrorMessage] = useState('');
  const [testAdviceMessage, setTestAdviceMessage] = useState('');

  const updateAiProviderConfig = useAiInfraStore((s) => s.updateAiProviderConfig);
  const toggleProviderEnabled = useAiInfraStore((s) => s.toggleProviderEnabled);
  const fetchRemoteModelList = useAiInfraStore((s) => s.fetchRemoteModelList);
  
  // Fetch existing configs safely
  const openaiConfig = useAiInfraStore(aiProviderSelectors.providerConfigById('openai'), isEqual);
  const googleConfig = useAiInfraStore(aiProviderSelectors.providerConfigById('google'), isEqual);
  const anthropicConfig = useAiInfraStore(aiProviderSelectors.providerConfigById('anthropic'), isEqual);

  // Sync API key & Base URL when selected provider changes
  useEffect(() => {
    let key = '';
    let base = '';
    if (selectedProvider === 'openai') {
      key = openaiConfig?.keyVaults?.apiKey || '';
      base = openaiConfig?.keyVaults?.baseURL || '';
    } else if (selectedProvider === 'google') {
      key = googleConfig?.keyVaults?.apiKey || '';
      base = googleConfig?.keyVaults?.baseURL || '';
    } else if (selectedProvider === 'anthropic') {
      key = anthropicConfig?.keyVaults?.apiKey || '';
      base = anthropicConfig?.keyVaults?.baseURL || '';
    }
    setApiKey(key);
    setBaseURL(base);
    setTestStatus('idle');
    setTestErrorMessage('');
    setTestAdviceMessage('');
  }, [selectedProvider, openaiConfig, googleConfig, anthropicConfig]);

  const handleSave = useCallback(async () => {
    const providerId = selectedProvider;
    let configToUpdate = openaiConfig;
    if (providerId === 'google') configToUpdate = googleConfig;
    else if (providerId === 'anthropic') configToUpdate = anthropicConfig;

    // Save key & base URL
    await updateAiProviderConfig(providerId, {
      keyVaults: {
        ...configToUpdate?.keyVaults,
        apiKey: apiKey.trim(),
        baseURL: baseURL.trim() || undefined,
      },
    });

    // Enable provider
    await toggleProviderEnabled(providerId, true);
  }, [selectedProvider, apiKey, baseURL, openaiConfig, googleConfig, anthropicConfig, updateAiProviderConfig, toggleProviderEnabled]);

  // Method to extract advice based on error codes and proxy configuration
  const getErrorAdvice = useCallback((errorStr: string, hasProxy: boolean) => {
    const lowerErr = errorStr.toLowerCase();
    
    if (lowerErr.includes('ssl') || lowerErr.includes('certificate') || lowerErr.includes('self signed')) {
      return t('screenProvider.advice.ssl', 'Conseil : Problème de certificat SSL. Si vous utilisez un proxy local ou d\'entreprise, assurez-vous que l\'URL commence bien par HTTPS et que vos certificats sont valides.');
    }
    
    if (lowerErr.includes('url') || lowerErr.includes('parse') || lowerErr.includes('failed to parse')) {
      return t('screenProvider.advice.invalidUrl', 'Conseil : L\'URL de base saisie est invalide. Veuillez vérifier le protocole (http:// ou https://) et le format de l\'adresse.');
    }

    if (lowerErr.includes('401') || lowerErr.includes('unauthorized') || lowerErr.includes('api key') || lowerErr.includes('apikey') || lowerErr.includes('incorrect api key')) {
      return t('screenProvider.advice.unauthorized', 'Conseil : Authentification échouée. Vérifiez que votre clé API est valide et qu\'elle ne contient pas d\'espaces superflus.');
    }

    if (lowerErr.includes('404') || lowerErr.includes('not found')) {
      return t('screenProvider.advice.notFound', 'Conseil : Adresse non trouvée (404). Vérifiez si l\'URL de base de votre proxy est correcte et se termine par la version d\'API attendue (ex: /v1).');
    }

    if (lowerErr.includes('403') || lowerErr.includes('forbidden')) {
      return t('screenProvider.advice.forbidden', 'Conseil : Accès interdit (403). Cela peut provenir d\'un blocage géographique, de droits insuffisants sur votre clé d\'API, ou d\'un blocage par le proxy.');
    }

    if (lowerErr.includes('timeout') || lowerErr.includes('timed out') || lowerErr.includes('refused') || lowerErr.includes('fetch failed')) {
      return t('screenProvider.advice.timeout', 'Conseil : Impossible d\'atteindre le serveur. Assurez-vous d\'être connecté à Internet et que l\'URL du proxy ou du fournisseur d\'IA est bien accessible.');
    }

    if (hasProxy) {
      return t('screenProvider.advice.generalProxy', 'Conseil : Erreur avec le proxy configuré. Assurez-vous de sa compatibilité avec les API OpenAI/Google/Anthropic et de son état en ligne.');
    }

    return t('screenProvider.advice.general', 'Conseil : Veuillez vérifier votre connexion réseau, l\'exactitude de votre clé API et la validité de l\'adresse de proxy si vous en utilisez un.');
  }, [t]);

  const handleTestConnection = useCallback(async () => {
    if (!apiKey.trim()) {
      setTestStatus('error');
      setTestErrorMessage(t('screenProvider.test.noKey', 'Veuillez d\'abord saisir une clé API.'));
      setTestAdviceMessage('');
      return;
    }

    setTestStatus('loading');
    setTestErrorMessage('');
    setTestAdviceMessage('');

    try {
      // 1. Save settings to store so the backend router can use it
      await handleSave();

      // 2. Resolve default check models
      let checkModel = 'gpt-4o-mini';
      if (selectedProvider === 'google') checkModel = 'gemini-1.5-flash';
      else if (selectedProvider === 'anthropic') checkModel = 'claude-3-5-sonnet-20241022';

      // 3. Perform connectivity test
      let testFailed = false;
      await chatService.fetchPresetTaskResult({
        onError: (_, rawError) => {
          testFailed = true;
          setTestStatus('error');
          const errorMsg = rawError?.message || t('screenProvider.test.failedMsg', 'Erreur de connexion.');
          setTestErrorMessage(errorMsg);
          setTestAdviceMessage(getErrorAdvice(errorMsg, !!baseURL.trim()));
        },
        onFinish: async (value) => {
          if (!testFailed) {
            setTestStatus('success');
            // Background sync of remote models capabilities on success
            fetchRemoteModelList(selectedProvider).catch((err) => {
              console.error(`[AIProviderOnboarding] Failed to sync models for ${selectedProvider}:`, err);
            });
          }
        },
        onLoadingChange: () => {},
        params: {
          messages: [
            {
              content: 'ping',
              role: 'user',
            },
          ],
          model: checkModel,
          provider: selectedProvider,
        },
        trace: {
          sessionId: `connection-test:${selectedProvider}`,
          topicId: checkModel,
          traceName: TraceNameMap.ConnectivityChecker,
        },
      });
    } catch (err: any) {
      setTestStatus('error');
      const errorMsg = err?.message || t('screenProvider.test.error', 'Une erreur inattendue est survenue.');
      setTestErrorMessage(errorMsg);
      setTestAdviceMessage(getErrorAdvice(errorMsg, !!baseURL.trim()));
    }
  }, [apiKey, selectedProvider, handleSave, getErrorAdvice, baseURL, fetchRemoteModelList, t]);

  const handleConfigure = useCallback(async () => {
    if (apiKey.trim()) {
      await handleSave();
      // Background sync of remote models on successful final confirmation
      fetchRemoteModelList(selectedProvider).catch((err) => {
        console.error(`[AIProviderOnboarding] Final sync models failed for ${selectedProvider}:`, err);
      });
    }
    onNext();
  }, [apiKey, handleSave, selectedProvider, fetchRemoteModelList, onNext]);

  return (
    <Flexbox gap={16} style={{ height: '100%', minHeight: '100%', width: '100%' }}>
      <Flexbox>
        <LobeMessage
          sentences={[
            t('screenProvider.title', 'Choisissez votre fournisseur d\'IA'),
            t('screenProvider.title2', 'Configurez vos clés API et proxys'),
            t('screenProvider.title3', 'Prêt pour l\'aventure mAI !'),
          ]}
        />
        <Text as={'p'} color={cssVar.colorTextSecondary}>
          {t('screenProvider.description', 'Vous pouvez configurer une clé API et un endpoint personnalisé (proxy) pour OpenAI, Google ou Anthropic maintenant pour utiliser directement mAI. Sinon, vous pouvez ignorer cette étape et le faire plus tard dans les paramètres.')}
        </Text>
      </Flexbox>

      {/* Provider Selector Cards */}
      <Flexbox horizontal gap={12} style={{ width: '100%' }}>
        {(['openai', 'google', 'anthropic'] as ProviderId[]).map((pid) => (
          <Block
            clickable
            align="center"
            flex={1}
            justify="center"
            key={pid}
            padding={16}
            variant={'outlined'}
            style={{
              borderColor: selectedProvider === pid ? cssVar.colorSuccess : undefined,
              borderRadius: 12,
              textAlign: 'center',
              transition: 'all 0.2s ease',
            }}
            onClick={() => setSelectedProvider(pid)}
          >
            <ProviderIcon provider={pid} size={40} type={'avatar'} />
            <Text strong style={{ display: 'block', marginTop: 8, textTransform: 'capitalize' }}>
              {pid === 'openai' ? 'OpenAI' : pid === 'google' ? 'Google' : 'Anthropic'}
            </Text>
          </Block>
        ))}
      </Flexbox>

      {/* Form Fields */}
      <Flexbox gap={12} style={{ width: '100%', marginTop: 8 }}>
        <Flexbox gap={6}>
          <Text strong fontSize={14}>
            {t('screenProvider.apiKeyLabel', 'Clé API')}
          </Text>
          <Input
            placeholder={t('screenProvider.apiKeyPlaceholder', `Saisissez votre clé API ${selectedProvider === 'openai' ? 'OpenAI' : selectedProvider === 'google' ? 'Google' : 'Anthropic'}`)}
            prefix={<KeyRoundIcon size={16} style={{ marginRight: 4, color: cssVar.colorTextDescription }} />}
            size={'large'}
            style={{ width: '100%' }}
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </Flexbox>

        <Flexbox gap={6}>
          <Text strong fontSize={14}>
            {t('screenProvider.baseURLLabel', 'Proxy / URL de base (Optionnel)')}
          </Text>
          <Input
            placeholder={t('screenProvider.baseURLPlaceholder', `Ex: https://api.openai-proxy.com/v1`)}
            prefix={<GlobeIcon size={16} style={{ marginRight: 4, color: cssVar.colorTextDescription }} />}
            size={'large'}
            style={{ width: '100%' }}
            value={baseURL}
            onChange={(e) => setBaseURL(e.target.value)}
          />
        </Flexbox>

        {/* Connectivity Test Actions and Alerts */}
        <Flexbox horizontal align="center" gap={8} style={{ marginTop: 4 }}>
          <Button
            disabled={testStatus === 'loading'}
            icon={testStatus === 'loading' ? <Loader2Icon className="anticon-spin" size={16} /> : undefined}
            onClick={handleTestConnection}
          >
            {testStatus === 'loading' ? t('screenProvider.test.testing', 'Test en cours...') : t('screenProvider.test.button', 'Tester la connexion')}
          </Button>
          
          {testStatus === 'success' && (
            <Flexbox horizontal align="center" gap={4} style={{ color: cssVar.colorSuccess }}>
              <CheckCircle2Icon size={16} />
              <Text style={{ color: cssVar.colorSuccess }}>{t('screenProvider.test.success', 'Connexion réussie ! (Modèles synchronisés)')}</Text>
            </Flexbox>
          )}
        </Flexbox>

        {testStatus === 'error' && (
          <Flexbox gap={8}>
            <Alert
              showIcon
              description={testErrorMessage}
              message={t('screenProvider.test.errorTitle', 'Échec du test')}
              type="error"
              extra={
                <Button size="small" type="primary" onClick={handleTestConnection}>
                  {t('screenProvider.test.retry', 'Réessayer')}
                </Button>
              }
            />
            {testAdviceMessage && (
              <Alert
                showIcon
                description={testAdviceMessage}
                type="warning"
              />
            )}
          </Flexbox>
        )}
      </Flexbox>

      <OnboardingFooterActions
        left={
          <Button
            icon={Undo2Icon}
            style={{ color: cssVar.colorTextDescription }}
            type={'text'}
            onClick={onBack}
          >
            {t('back')}
          </Button>
        }
        right={
          <Flexbox horizontal gap={12}>
            <Button
              style={{ color: cssVar.colorTextSecondary }}
              type={'text'}
              onClick={onNext}
            >
              {t('screenProvider.later', 'Plus Tard')}
            </Button>
            <Button
              type={'primary'}
              onClick={handleConfigure}
            >
              {t('screenProvider.configure', 'Configurer')}
            </Button>
          </Flexbox>
        }
      />
    </Flexbox>
  );
});

AIProviderStep.displayName = 'AIProviderStep';

export default AIProviderStep;
