import {
  AGENT_SIGNAL_REFLECTION_IDENTIFIER,
  AGENT_SIGNAL_REFLECTION_TOOL_API_NAMES,
  AgentSignalToolExecutionRuntime,
} from '@lobechat/builtin-tool-agent-signal';

import { createResourceRuntimePrimitives } from '@/server/services/agentSignal/services/selfIteration/tools/runtimePrimitives';
import { SkillManagementDocumentService } from '@/server/services/skillManagement';

import type { ServerRuntimeRegistration } from './types';

/**
 * Registers the post-turn self-reflection builtin server runtime, so an
 * `execAgent` run with `plugins: ['agent-signal-reflection']` can execute its
 * tools. The reflection surface is resource-only (safe skill reads / writes +
 * user-memory writes) plus the artifact recorders, which the package runtime
 * echoes. Evidence is embedded in the agent's prompt, so there is no collector.
 */
export const agentSignalReflectionRuntime: ServerRuntimeRegistration = {
  factory: (context) => {
<<<<<<< HEAD:src/server/services/toolExecution/serverRuntimes/agentSignalReflection.ts
    const { agentId, serverDB, userId } = context;
=======
    const { agentId, serverDB, userId, workspaceId } = context;
>>>>>>> 1fa6f47fc9f31fb26afca2b61a9c57751eaff2e0:apps/server/src/services/toolExecution/serverRuntimes/agentSignalReflection.ts
    if (!agentId || !userId || !serverDB) {
      throw new Error('agent-signal-reflection requires agentId, userId and serverDB');
    }

    const service = createResourceRuntimePrimitives({
      agentId,
      db: serverDB,
      memoryReason: (count) =>
        `Agent Signal self-reflection memory candidate from ${count} evidence refs.`,
<<<<<<< HEAD:src/server/services/toolExecution/serverRuntimes/agentSignalReflection.ts
      skillDocumentService: new SkillManagementDocumentService(serverDB, userId),
      userId,
=======
      skillDocumentService: new SkillManagementDocumentService(serverDB, userId, workspaceId),
      userId,
      workspaceId,
>>>>>>> 1fa6f47fc9f31fb26afca2b61a9c57751eaff2e0:apps/server/src/services/toolExecution/serverRuntimes/agentSignalReflection.ts
    });

    return new AgentSignalToolExecutionRuntime({
      apiNames: AGENT_SIGNAL_REFLECTION_TOOL_API_NAMES,
      service,
    });
  },
  identifier: AGENT_SIGNAL_REFLECTION_IDENTIFIER,
};
