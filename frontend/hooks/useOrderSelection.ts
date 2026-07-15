'use client';

import { useCallback, useMemo, useState } from 'react';

export const useOrderSelection = (initialSelected: string[] = []) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelected);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((selected) => selected !== id) : [...current, id]
    );
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(ids);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const hasSelection = selectedIds.length > 0;

  const isSelected = useCallback((id: string) => selectedIds.includes(id), [selectedIds]);

  const selectedCount = useMemo(() => selectedIds.length, [selectedIds]);

  return {
    selectedIds,
    selectedCount,
    hasSelection,
    isSelected,
    toggleSelection,
    selectAll,
    clearSelection,
  };
};
