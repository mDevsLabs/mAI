import { describe, it, expect, beforeEach, vi } from 'vitest';
import { KnowledgeRepo } from '../index';
import { DOCUMENT_FOLDER_TYPE } from '../../../schemas';

describe('KnowledgeRepo Performance', () => {
  let repository: any;
  let mockDb: any;
  let mockFileModel: any;
  let mockDocumentModel: any;

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
    };

    mockFileModel = {
      delete: vi.fn().mockImplementation(async () => {
        return new Promise(resolve => setTimeout(resolve, 5)); // simulate db latency
      }),
    };

    mockDocumentModel = {
      findById: vi.fn(),
      delete: vi.fn().mockResolvedValue(undefined),
    };

    repository = new KnowledgeRepo(mockDb as any, 'user-1', 'workspace-1');
    (repository as any).fileModel = mockFileModel;
    (repository as any).documentModel = mockDocumentModel;
  });

  it('measures deletion performance', async () => {
    const numFiles = 100;
    mockDocumentModel.findById.mockResolvedValue({
      id: 'folder-1',
      fileType: DOCUMENT_FOLDER_TYPE,
    });

    mockDb.query.documents.findMany.mockResolvedValue([]);

    const mockFiles = Array.from({ length: numFiles }).map((_, i) => ({ id: `file-${i}` }));
    mockDb.query.files.findMany.mockResolvedValue(mockFiles);

    const startTime = Date.now();
    await (repository as any).deleteDocumentWithRelations('folder-1');
    const endTime = Date.now();

    const duration = endTime - startTime;
    console.log(`Deletion of ${numFiles} child files took ${duration}ms`);

    expect(mockFileModel.delete).toHaveBeenCalledTimes(numFiles);
  });
});
