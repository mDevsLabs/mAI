import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DocumentService } from '../index';

describe('DocumentService Performance Benchmark', () => {
  let service: DocumentService;

  beforeEach(() => {
    service = new DocumentService('user-1', 'workspace-1');
  });

  it('should recursively delete folder and all children quickly', async () => {
    // Generate large number of items
    const numChildren = 100;
    const numFiles = 100;

    const children = Array.from({ length: numChildren }, (_, i) => ({ id: `child-${i}` }));
    const files = Array.from({ length: numFiles }, (_, i) => ({ id: `file-${i}` }));

    // Mock dependencies
    vi.spyOn(service as any, 'documentModel', 'get').mockReturnValue({
      findById: vi.fn().mockImplementation(async (id) => {
        if (id === 'folder-1') {
          return { id: 'folder-1', fileType: 'custom/folder', fileId: null };
        }
        return { id, fileType: 'custom/document', fileId: `associated-file-${id}` };
      }),
      delete: vi.fn().mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 5)); // 5ms delay to simulate DB
      }),
    });

    vi.spyOn(service as any, 'db', 'get').mockReturnValue({
      query: {
        documents: {
          findMany: vi.fn().mockResolvedValue(children),
        },
        files: {
          findMany: vi.fn().mockResolvedValue(files),
        },
      },
    });

    // We'll actually invoke the real deleteFileRecordAndStorage but mock what it calls
    vi.spyOn(service as any, 'fileModel', 'get').mockReturnValue({
      delete: vi.fn().mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 5)); // 5ms delay
        return { url: 'mocked-url' };
      }),
    });

    vi.spyOn(service as any, 'fileService', 'get').mockReturnValue({
      deleteFile: vi.fn().mockImplementation(async () => {
         await new Promise((resolve) => setTimeout(resolve, 5)); // 5ms delay
      }),
    });

    // Instead of executing real recursion for the children's deleteDocument, let's just
    // spy on deleteDocument to only execute for 'folder-1' and mock it for children.
    // Wait, the children array returned is mocked, but inside deleteDocument it will call
    // findById for each child, which we mocked above to return a document, so it will
    // execute `deleteFileRecordAndStorage` and `documentModel.delete`.
    // So the recursive calls will just delete the child and its associated file without further recursion
    // since findById returns `fileType: 'custom/document'`.

    const startTime = Date.now();
    await service.deleteDocument('folder-1');
    const endTime = Date.now();

    const executionTime = endTime - startTime;
    console.log(`Execution time: ${executionTime}ms`);

    // Verify it called the correct number of times
    // (numChildren) document models deleted
    // (numFiles + numChildren) files deleted (files in folder + associated files of children)
    expect((service as any).documentModel.delete).toHaveBeenCalledTimes(numChildren + 1);
    expect((service as any).fileModel.delete).toHaveBeenCalledTimes(numFiles + numChildren);
  });
});
