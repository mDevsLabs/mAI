import { type EnabledAiModel, ModelProvider } from 'model-bank';
import { afterEach, describe, expect, it } from 'vitest';

import { useAiInfraStore } from '@/store/aiInfra';

import {
  findDeploymentName,
  getRuntimeModelKnowledgeCutoff,
  isCanUseAudio,
  isCanUseVideo,
  isCanUseVision,
} from './helper';

describe('chat helper', () => {
  afterEach(() => {
    useAiInfraStore.setState({ enabledAiModels: [], aiProviderDetailMap: {} });
  });

  describe('findDeploymentName', () => {
    it('should return undefined if provider settings do not show deploy name', () => {
      useAiInfraStore.setState({
        aiProviderDetailMap: {
          'test-provider': {
            id: 'test-provider',
            settings: { showDeployName: false },
          } as any,
        },
      });

      expect(findDeploymentName('test-model', 'test-provider')).toBeUndefined();
    });

    it('should return the model id if provider shows deploy name but model has no specific deploymentName config', () => {
      useAiInfraStore.setState({
        aiProviderDetailMap: {
          'test-provider': {
            id: 'test-provider',
            settings: { showDeployName: true },
          } as any,
        },
        enabledAiModels: [
          {
            id: 'test-model',
            providerId: 'test-provider',
          } as any,
        ],
      });

      expect(findDeploymentName('test-model', 'test-provider')).toBe('test-model');
    });

    it('should return the specific deploymentName if configured on the model and provider shows deploy name', () => {
      useAiInfraStore.setState({
        aiProviderDetailMap: {
          'test-provider': {
            id: 'test-provider',
            settings: { showDeployName: true },
          } as any,
        },
        enabledAiModels: [
          {
            id: 'test-model',
            providerId: 'test-provider',
            config: {
              deploymentName: 'my-custom-deployment',
            },
          } as any,
        ],
      });

      expect(findDeploymentName('test-model', 'test-provider')).toBe('my-custom-deployment');
    });
  });

  it('should resolve LobeHub routed model abilities by model id fallback', () => {
    useAiInfraStore.setState({
      enabledAiModels: [
        {
          abilities: { audio: true, video: true, vision: true },
          id: 'gemini-3.1-flash-lite-preview',
          providerId: ModelProvider.Google,
          type: 'chat',
        } as EnabledAiModel,
      ],
    });

    expect(isCanUseVision('gemini-3.1-flash-lite-preview', ModelProvider.LobeHub)).toBe(true);
    expect(isCanUseVideo('gemini-3.1-flash-lite-preview', ModelProvider.LobeHub)).toBe(true);
    expect(isCanUseAudio('gemini-3.1-flash-lite-preview', ModelProvider.LobeHub)).toBe(true);
  });

  it('should not fallback across non-LobeHub providers', () => {
    useAiInfraStore.setState({
      enabledAiModels: [
        {
          abilities: { audio: true, video: true, vision: true },
          id: 'gemini-3.1-flash-lite-preview',
          providerId: ModelProvider.Google,
          type: 'chat',
        } as EnabledAiModel,
      ],
    });

    expect(isCanUseVision('gemini-3.1-flash-lite-preview', ModelProvider.OpenAI)).toBe(false);
    expect(isCanUseVideo('gemini-3.1-flash-lite-preview', ModelProvider.OpenAI)).toBe(false);
    expect(isCanUseAudio('gemini-3.1-flash-lite-preview', ModelProvider.OpenAI)).toBe(false);
  });

  it('should resolve exact model knowledge cutoff', () => {
    useAiInfraStore.setState({
      enabledAiModels: [
        {
          id: 'gpt-4o',
          knowledgeCutoff: '2023-10',
          providerId: ModelProvider.OpenAI,
          type: 'chat',
        } as EnabledAiModel,
      ],
    });

    expect(getRuntimeModelKnowledgeCutoff('gpt-4o', ModelProvider.OpenAI)).toBe('2023-10');
  });

  it('should resolve LobeHub routed model knowledge cutoff by model id fallback', () => {
    useAiInfraStore.setState({
      enabledAiModels: [
        {
          id: 'gemini-3.1-flash-lite-preview',
          knowledgeCutoff: '2025-01',
          providerId: ModelProvider.Google,
          type: 'chat',
        } as EnabledAiModel,
      ],
    });

    expect(
      getRuntimeModelKnowledgeCutoff('gemini-3.1-flash-lite-preview', ModelProvider.LobeHub),
    ).toBe('2025-01');
  });

  it('should not fallback model knowledge cutoff across non-LobeHub providers', () => {
    useAiInfraStore.setState({
      enabledAiModels: [
        {
          id: 'gemini-3.1-flash-lite-preview',
          knowledgeCutoff: '2025-01',
          providerId: ModelProvider.Google,
          type: 'chat',
        } as EnabledAiModel,
      ],
    });

    expect(
      getRuntimeModelKnowledgeCutoff('gemini-3.1-flash-lite-preview', ModelProvider.OpenAI),
    ).toBeUndefined();
  });
});
