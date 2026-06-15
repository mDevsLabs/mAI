// @vitest-environment node
import { promisify } from 'node:util';
import { brotliCompress, brotliDecompress, constants } from 'node:zlib';

import type { ExecutionSnapshot } from '@lobechat/agent-tracing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const compressBr = promisify(brotliCompress);
const decompressBr = promisify(brotliDecompress);

const BROTLI_COMPRESS_OPTS = {
  params: { [constants.BROTLI_PARAM_QUALITY]: 4 },
};

// Stub FileS3 with vi.fn methods so we can assert calls + return canned data.
const uploadBuffer = vi.fn();
const getFileByteArray = vi.fn();
const getFileContent = vi.fn();
const deleteFile = vi.fn();

vi.mock('@/server/modules/S3', () => ({
  FileS3: vi.fn(() => ({
    deleteFile,
    getFileByteArray,
    getFileContent,
    uploadBuffer,
  })),
}));

// Imported after the mock so the constructor pulls in the stub.
const { S3SnapshotStore } = await import('./S3SnapshotStore');

const sampleSnapshot = (overrides: Partial<ExecutionSnapshot> = {}): ExecutionSnapshot =>
  ({
    agentId: 'agt_abc',
    completedAt: 1_777_000_000_500,
    operationId: 'op_1777000000000_agt_abc_tpc_xyz_QwErTy',
    startedAt: 1_777_000_000_000,
    steps: [],
    topicId: 'tpc_xyz',
    totalCost: 0,
    totalSteps: 0,
    totalTokens: 0,
    ...overrides,
  }) as unknown as ExecutionSnapshot;

beforeEach(() => {
  uploadBuffer.mockReset().mockResolvedValue(undefined);
  getFileByteArray.mockReset();
  getFileContent.mockReset();
  deleteFile.mockReset().mockResolvedValue(undefined);
});

describe('S3SnapshotStore.save', () => {
  it('writes to agent-traces/{agentId}/{topicId}/{operationId}.json.br with brotli body', async () => {
    const store = new S3SnapshotStore();
    const snap = sampleSnapshot();

    await store.save(snap);

    expect(uploadBuffer).toHaveBeenCalledTimes(1);
    const [key, body, contentType] = uploadBuffer.mock.calls[0];
    expect(key).toBe(`agent-traces/${snap.agentId}/${snap.topicId}/${snap.operationId}.json.br`);
    expect(contentType).toBe('application/brotli');
    expect(Buffer.isBuffer(body)).toBe(true);

    const roundtripped = JSON.parse((await decompressBr(body)).toString('utf8'));
    expect(roundtripped).toEqual(snap);
  });

  it('falls back to "unknown" when agentId or topicId is missing', async () => {
    const store = new S3SnapshotStore();
    await store.save(sampleSnapshot({ agentId: undefined, topicId: undefined }));

    const [key] = uploadBuffer.mock.calls[0];
    expect(key).toBe(
      'agent-traces/unknown/unknown/op_1777000000000_agt_abc_tpc_xyz_QwErTy.json.br',
    );
  });
});

describe('S3SnapshotStore.savePartial', () => {
  it('writes to agent-traces/_partial/{operationId}.json.br with compressed body', async () => {
    const store = new S3SnapshotStore();
    const partial = { operationId: 'op_partial_1', steps: [{ stepIndex: 0 }] };

    await store.savePartial('op_partial_1', partial as Partial<ExecutionSnapshot>);

    expect(uploadBuffer).toHaveBeenCalledTimes(1);
    const [key, body, contentType] = uploadBuffer.mock.calls[0];
    expect(key).toBe('agent-traces/_partial/op_partial_1.json.br');
    expect(contentType).toBe('application/brotli');

    const roundtripped = JSON.parse((await decompressBr(body)).toString('utf8'));
    expect(roundtripped).toEqual(partial);
  });
});

describe('S3SnapshotStore.loadPartial', () => {
  it('decodes the brotli-compressed .json.br object when present', async () => {
    const partial = { operationId: 'op_load_1', steps: [{ stepIndex: 7 }] };
    const compressed = await compressBr(Buffer.from(JSON.stringify(partial)), BROTLI_COMPRESS_OPTS);
    getFileByteArray.mockResolvedValueOnce(new Uint8Array(compressed));

    const store = new S3SnapshotStore();
    const result = await store.loadPartial('op_load_1');

    expect(getFileByteArray).toHaveBeenCalledWith('agent-traces/_partial/op_load_1.json.br');
    expect(result).toEqual(partial);
  });

  it('falls back to legacy uncompressed .json when .json.br is missing', async () => {
    const partial = { operationId: 'op_legacy_1' };
    getFileByteArray.mockRejectedValueOnce(new Error('NoSuchKey'));
    getFileContent.mockResolvedValueOnce(JSON.stringify(partial));

    const store = new S3SnapshotStore();
    const result = await store.loadPartial('op_legacy_1');

    expect(getFileByteArray).toHaveBeenCalledWith('agent-traces/_partial/op_legacy_1.json.br');
    expect(getFileContent).toHaveBeenCalledWith('agent-traces/_partial/op_legacy_1.json');
    expect(result).toEqual(partial);
  });

  it('returns null when neither key exists', async () => {
    getFileByteArray.mockRejectedValueOnce(new Error('NoSuchKey'));
    getFileContent.mockRejectedValueOnce(new Error('NoSuchKey'));

    const store = new S3SnapshotStore();
    expect(await store.loadPartial('op_missing')).toBeNull();
  });
});

describe('S3SnapshotStore.removePartial', () => {
  it('deletes both the .json.br and legacy .json keys', async () => {
    const store = new S3SnapshotStore();
    await store.removePartial('op_remove_1');

    const keys = deleteFile.mock.calls.map(([k]) => k);
    expect(keys).toContain('agent-traces/_partial/op_remove_1.json.br');
    expect(keys).toContain('agent-traces/_partial/op_remove_1.json');
    expect(deleteFile).toHaveBeenCalledTimes(2);
  });

  it('does not throw when one delete fails (allSettled)', async () => {
    deleteFile.mockRejectedValueOnce(new Error('NoSuchKey')).mockResolvedValueOnce(undefined);

    const store = new S3SnapshotStore();
    await expect(store.removePartial('op_partial_err')).resolves.toBeUndefined();
  });
});

describe('S3SnapshotStore query stubs', () => {
  it('returns null/[] for unsupported query methods (OTEL backend owns querying)', async () => {
    const store = new S3SnapshotStore();
    expect(await store.get('any')).toBeNull();
    expect(await store.getLatest()).toBeNull();
    expect(await store.list()).toEqual([]);
    expect(await store.listPartials()).toEqual([]);
  });
});
