import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DocumentService } from '../index';
import { LobeChatDatabase } from '@lobechat/database';

// Mock dependencies
vi.mock('@lobechat/database', () => ({
  eq: vi.fn(),
  and: vi.fn(),
  sql: vi.fn(),
  desc: vi.fn(),
}));

describe('DocumentService Benchmark', () => {
  let service: DocumentService;
  let mockDb: any;
  let mockDocumentModel: any;
  let mockFileModel: any;
  let mockDocumentHistoryService: any;

  beforeEach(() => {
    mockDb = {
      query: {
        documents: {
          findMany: vi.fn(),
        },
        files: {
          findMany: vi.fn(),
        },
      },
      transaction: vi.fn(),
    };

    mockDocumentModel = {
      findById: vi.fn(),
      delete: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    };

    mockFileModel = {
      findById: vi.fn(),
      delete: vi.fn(),
      create: vi.fn(),
    };

    mockDocumentHistoryService = {
      createHistory: vi.fn(),
      getHistoryList: vi.fn(),
      getHistoryDetail: vi.fn(),
      deleteHistory: vi.fn(),
    };

    service = new DocumentService(mockDb as any, 'user-1', 'workspace-1');

    // Inject mocks
    (service as any).documentModel = mockDocumentModel;
    (service as any).fileModel = mockFileModel;
    (service as any).documentHistoryServiceInstance = mockDocumentHistoryService;

    // mock deleteFileRecordAndStorage directly for benchmark
    (service as any).deleteFileRecordAndStorage = vi.fn().mockImplementation(async (id) => {
       await new Promise(resolve => setTimeout(resolve, 1));
    });
  });

  it('should measure deleteDocument performance for many children and childFiles', async () => {
    // Setup a folder with 1000 child files
    mockDocumentModel.findById.mockImplementation((id: string) => {
      if (id === 'folder-1') {
        return Promise.resolve({
          id: 'folder-1',
          fileType: 'custom/folder',
          fileId: null,
        });
      }
      return Promise.resolve(undefined);
    });

    mockDb.query.documents.findMany.mockResolvedValue([]);

    // 1000 child files
    const childFiles = Array.from({ length: 1000 }, (_, i) => ({
      id: `file-${i}`,
    }));
    mockDb.query.files.findMany.mockResolvedValue(childFiles);

    const start = performance.now();
    await service.deleteDocument('folder-1');
    const end = performance.now();

    console.log(`Deletion of 1000 child files took ${end - start}ms`);
    expect((service as any).deleteFileRecordAndStorage).toHaveBeenCalledTimes(1000);
  }, 10000);
});
