import { fileManagerSelectors, useFileStore } from '@/store/file';
import { SortType } from '@/types/files';
import { type ResourceItem } from '@/types/resource';

import { type SelectAllState, type State } from './initialState';

/**
 * Sort a file list based on sort settings
 * This is a pure function that can be used with any file list
 */
export const sortFileList = (
  fileList: ResourceItem[] | undefined,
  sorter: 'name' | 'createdAt' | 'size',
  sortType: SortType,
): ResourceItem[] | undefined => {
  if (!fileList || fileList.length === 0) return fileList;

  const sorted = [...fileList];

  sorted.sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sorter) {
      case 'name': {
        aValue = a.name?.toLowerCase() || '';
        bValue = b.name?.toLowerCase() || '';
        break;
      }
      case 'size': {
        aValue = a.size || 0;
        bValue = b.size || 0;
        break;
      }
      default: {
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      }
    }

    if (sortType === SortType.Asc) {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    }
    return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
  });

  return sorted;
};

/**
 * Get sorted file list based on current sort settings
 * Reads from FileStore and applies sorting from ResourceManagerStore
 * @deprecated Use sortFileList with data from SWR hook instead
 */
const getSortedFileList = (s: State): ResourceItem[] | undefined => {
  const fileList = useFileStore.getState().fileList as any;
  return sortFileList(fileList, s.sorter, s.sortType);
};

/**
 * Get current file by ID from FileStore
 * Returns undefined if no currentViewItemId or file not found
 */
const getCurrentFile = (s: State): ResourceItem | undefined => {
  if (!s.currentViewItemId) return undefined;
  return fileManagerSelectors.getFileById(s.currentViewItemId)(useFileStore.getState()) as unknown as ResourceItem;
};

const isFilePreviewMode = (s: State) => s.mode === 'editor' && !!s.currentViewItemId;

export const isExplorerItemSelected = ({
  id,
  selectAllState,
  selectedIds,
}: {
  id: string;
  selectAllState: SelectAllState;
  selectedIds: string[];
}) => (selectAllState === 'all' ? !selectedIds.includes(id) : selectedIds.includes(id));

export const getExplorerSelectAllUiState = ({
  data,
  hasMore,
  selectAllState,
  selectedIds,
}: {
  data: Array<{ id: string }>;
  hasMore: boolean;
  selectAllState: SelectAllState;
  selectedIds: string[];
}) => {
  const fileCount = data.length;
  const selectedCount = data.filter((item) =>
    isExplorerItemSelected({ id: item.id, selectAllState, selectedIds }),
  ).length;
  const allLoadedSelected = fileCount > 0 && selectedCount === fileCount;

  return {
    allSelected: allLoadedSelected,
    indeterminate: selectedCount > 0 && !allLoadedSelected,
    showSelectAllHint: selectAllState !== 'none' && (hasMore || selectAllState === 'all'),
  };
};

export const getExplorerSelectedCount = ({
  selectAllState,
  selectedIds,
  total,
}: {
  selectAllState: SelectAllState;
  selectedIds: string[];
  total?: number;
}) => {
  if (selectAllState !== 'all') return selectedIds.length;
  if (typeof total !== 'number') return 0;

  return Math.max(total - selectedIds.length, 0);
};

export const selectors = {
  category: (s: State) => s.category,
  currentViewItemId: (s: State) => s.currentViewItemId,
  getCurrentFile,
  getSortedFileList,
  isFilePreviewMode,
  mode: (s: State) => s.mode,
};
