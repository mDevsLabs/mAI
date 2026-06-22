// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { HeterogeneousPersistenceHandler } from '../HeterogeneousPersistenceHandler';

describe('HeterogeneousPersistenceHandler Benchmark', () => {
  it('measures persistToolBatch execution time with 50 tools', async () => {
    const mockMessageModel = {
      create: vi.fn().mockImplementation(async () => {
        await new Promise(r => setTimeout(r, 10)); // Simulate 10ms DB latency per create
      }),
      update: vi.fn().mockResolvedValue(undefined),
      batchCreate: vi.fn().mockImplementation(async () => {
        await new Promise(r => setTimeout(r, 10)); // Simulate 10ms DB latency for batchCreate
      }),
    };

    const mockDeps = {
      messageModel: mockMessageModel as any,
      threadModel: {} as any,
      topicModel: {} as any,
    };

    const handler = new HeterogeneousPersistenceHandler(mockDeps);

    const tools = Array.from({ length: 50 }).map((_, i) => ({
      isNew: true,
      payload: { id: `call_${i}`, apiName: 'test', arguments: '{}', identifier: 'test', type: 'function' },
      toolMessageId: `msg_${i}`
    }));

    const state = {
      agentId: 'agent-1',
      topicId: 'topic-1',
      toolMsgIdByCallId: new Map()
    };

    const intent = {
      kind: 'persistToolBatch', // Note: using kind as it's applyMainIntent
      assistantMessageId: 'asst-1',
      tools: tools,
      content: '',
      reasoning: ''
    };

    const start = Date.now();
    // Use applyMainIntent
    await handler['applyMainIntent'](state as any, intent as any);
    const end = Date.now();

    console.log(`Execution time for 50 tools: ${end - start}ms`);
    // Assert that the state map was updated correctly
    expect(state.toolMsgIdByCallId.size).toBe(50);
  });
});
