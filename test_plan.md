1. **Analyze the Issue**:
   The request asks to remove the fallbacks to `assistantMessageId` and `messageId` in `apps/server/src/services/agentSignal/services/receiptService.ts`.
   The code has:
   ```typescript
     const anchorMessageId =
       getPayloadString(payload, 'anchorMessageId') ??
       // TODO: Remove after producers stop emitting only assistantMessageId.
       getPayloadString(payload, 'assistantMessageId');
     const triggerMessageId =
       getPayloadString(payload, 'triggerMessageId') ??
       // TODO: Remove after producers stop emitting only messageId.
       getPayloadString(payload, 'messageId');
   ```

2. **Fix the code**:
   Update `apps/server/src/services/agentSignal/services/receiptService.ts` to:
   ```typescript
     const anchorMessageId = getPayloadString(payload, 'anchorMessageId');
     const triggerMessageId = getPayloadString(payload, 'triggerMessageId');
   ```

3. **Update tests**:
   Update `apps/server/src/services/agentSignal/services/__tests__/receiptService.test.ts` where `assistantMessageId` is used in the test's payload. Replace it with `anchorMessageId` and `triggerMessageId` if necessary or remove it.

4. **Verify changes**:
   Run vitest for the modified files. Include pre-commit steps.
