import React from 'react';

import { type OsaaminenDto } from '@/api/osaamiset';
import { useArrowKeyControls } from '@/hooks/useArrowKeyControls';
import { animateHideElement } from '@/utils/animations';

export const useVirtualAssistantSelection = (reduceMotion: boolean) => {
  const [selected, setSelected] = React.useState<OsaaminenDto[]>([]);
  const isSelectedEmpty = React.useMemo(() => selected.length === 0, [selected]);
  const selectedLabelId = React.useId();
  const [tagsPendingRemoval, setTagsPendingRemoval] = React.useState<string[]>([]);

  const {
    ref: selectedTagsRef,
    handleKeyDown: handleTagsKeyboardNavigation,
    setLastClickedIndex,
    initRovingTabindex,
  } = useArrowKeyControls(selected);

  React.useEffect(() => {
    if (!isSelectedEmpty) {
      initRovingTabindex();
    }
  }, [isSelectedEmpty, initRovingTabindex]);

  const removeSelectedTag = React.useCallback(
    (uri: string, index: number) => {
      setSelected((prev) => prev.filter((s) => s.uri !== uri));
      setLastClickedIndex(index);
      setTagsPendingRemoval((prev) => prev.filter((u) => u !== uri));
    },
    [setLastClickedIndex],
  );

  const handleTagRemove = React.useCallback(
    (e: React.MouseEvent<HTMLElement>, uri: string, index: number) => {
      if (reduceMotion) {
        removeSelectedTag(uri, index);
      } else {
        setTagsPendingRemoval((prev) => [...prev, uri]);
        animateHideElement(e.currentTarget, () => removeSelectedTag(uri, index));
      }
    },
    [reduceMotion, removeSelectedTag],
  );

  const clearSelection = React.useCallback(() => {
    setSelected([]);
    setTagsPendingRemoval([]);
  }, []);

  return {
    clearSelection,
    handleTagRemove,
    handleTagsKeyboardNavigation,
    isSelectedEmpty,
    selected,
    selectedLabelId,
    selectedTagsRef,
    setSelected,
    setTagsPendingRemoval,
    tagsPendingRemoval,
  };
};
